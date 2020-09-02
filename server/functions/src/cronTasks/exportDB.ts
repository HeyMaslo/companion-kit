import firestore from '@google-cloud/firestore';
import { BigQuery } from '@google-cloud/bigquery';
import { Storage } from '@google-cloud/storage';
import admin, { ProjectId } from 'server/services/admin';
import db, { Repo } from 'server/services/db';
import { JobStatuses, JobTypes, ServiceJob, ServiceJobIded } from 'common/models';
import { getIdentify } from 'common/database/repositories/dbProvider';

const client = new firestore.v1.FirestoreAdminClient();
const bigqueryClient = new BigQuery();
const storage = new Storage();

const bucketName = admin.storage().bucket().name;
const bucket = `gs://${bucketName}`;
const exportsFolder = `${bucket}/exports`;
const getCollectionExportPath = (key, timestamp) => {
    return `exports/companion-kit-${timestamp}/all_namespaces/kind_${key}/all_namespaces_kind_${key}.export_metadata`;
};
const collections = [
    'users',
    'clients',
    'coaches',
    'invitations',
    'prompts',
    'records',
    'accounts',
    'events',
    'intakeForms',
    'journal',
    'documents',
    'sessions',
    'clientPrompts',
];

export async function exportDB() {
    const databaseName =
        client.databasePath(ProjectId, 'default');
    const timestamp = Date.now();

    try {
        const responses = await client.exportDocuments({
            name: databaseName,
            outputUriPrefix: `${exportsFolder}/companion-kit-${timestamp}`,
            collectionIds: collections,
        });

        const response = responses[0];
        console.log(`Operation Name: ${response.name}`);

        const str = response.name.split('/');
        const jobId = str[str.length - 1];

        await Repo.ServiceJobs.addServiceJob({
            timestamp,
            jobId,
            description: `${exportsFolder}/companion-kit-${timestamp}`,
            type: JobTypes.Export,
            status: JobStatuses.InProcess,
        });

        return response;
    } catch (e) {
        console.error(e);
        throw new Error('Export operation failed');
    }
}

export async function importToBQ() {
    const datasetId = 'exports';
    const timestamp = Date.now();
    const metadata = {
        sourceFormat: 'DATASTORE_BACKUP',
        // Set the write disposition to overwrite existing table data.
        writeDisposition: 'WRITE_TRUNCATE',
        location: 'US',
    };

    const exports = await Repo.ServiceJobs.collection
        .where(nameof<ServiceJob>(r => r.type), '==', JobTypes.Export)
        .orderBy(nameof<ServiceJob>(r => r.timestamp), 'desc')
        .limit(1)
        .get();

    const lastExportDoc = exports.docs?.[0];

    if (lastExportDoc) {
        const Job = await Repo.ServiceJobs.addServiceJob({
            timestamp,
            jobId: null,
            description: `${exportsFolder}/companion-kit-${timestamp}`,
            type: JobTypes.Import,
            status: JobStatuses.InProcess,
        });

        const [datasetExists] = await bigqueryClient.dataset(datasetId).exists();

        if (!datasetExists) {
            const [dataset] = await bigqueryClient.createDataset(datasetId);
            console.log(`Dataset ${dataset.id} created.`);
        }

        const resp = await Promise.all(collections.map(async (collectionKey) => {
            try {
                const lastExport = getIdentify<ServiceJobIded>(lastExportDoc);
                const file = storage.bucket(bucketName).file(getCollectionExportPath(collectionKey, lastExport.timestamp));
                const [isExist] = await file.exists();

                if (isExist) {
                    const [job] = await bigqueryClient
                        .dataset(datasetId)
                        .table(collectionKey)
                        .load(file, metadata);

                    // load() waits for the job to finish
                    console.log(`Job ${job.id} completed.`);

                    // Check the job's status for errors
                    const errors = job.status.errors;
                    if (errors && errors.length > 0) {
                        console.warn(errors);
                        return { collectionKey, status: false, error: errors };
                    }
                } else {
                    return { collectionKey, status: false, error: 'File doesn\'t exists' };
                }
            } catch (e) {
                // console.log('error', e);
                return { collectionKey, status: false, error: e.message };
            }

            return { collectionKey, status: true };
        }));

        await Repo.ServiceJobs.ensureAndUpdate(Job.id, { status: JobStatuses.Success });

        console.log('resp', resp);
    }
}

async function deleteFromStorage(path) {
    await storage.bucket(bucketName).file(path).delete();

    console.log(`gs://${bucketName}/${path} deleted.`);
}
