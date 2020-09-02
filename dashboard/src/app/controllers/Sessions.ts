import { SessionsController as SessionsControllerBase, logger } from 'common/controllers/SessionsController';
import { ClientSessionEntryIded, ClientSessionEntry, AudioMetadata } from 'common/models';
import { Coaches as CoachesFunctions } from 'common/abstractions/functions';
import Firebase from 'common/services/firebase';
import { ProgressListener, StorageController } from 'common/controllers/StorageController';
import Paths from 'common/storage/paths';
import RepoFactory from 'common/controllers/RepoFactory';
import { getFilename } from 'app/helpers/files';

export type UploadSessionData = {
    audioMeta: AudioMetadata,
    file: File,
    dotExtension: string,
};

export type DeleteResult = {
    ok: boolean,
    recordOk: boolean,
    error?: Error | string,
};

export interface ISessionsController {
    readonly loading: boolean;
    readonly entries: ReadonlyArray<ClientSessionEntryIded>;

    getIsEntryExists(entryId: string): boolean;

    create(data: UploadSessionData, progressCallback?: ProgressListener): Promise<void>;
    delete(sessionId: string): Promise<DeleteResult>;
}

export class SessionsController extends SessionsControllerBase implements ISessionsController {

    async create(data: UploadSessionData, progressCallback: ProgressListener = null): Promise<void> {
        if (!this.coachId || !this.clientCardId) {
            throw new Error('Not initialized');
        }

        // upload
        const filename = StorageController.Instance.generateFileNameByDate(data.dotExtension);
        const path = Paths.getSessionEntryPath(this.coachId, this.clientCardId, filename);
        const metadata = {
            contentDisposition: `attachment; filename="${data.file.name}"`,
            cacheControl: 'no-cache, no-store, must-revalidate',
        };

        logger.log('Constructed path for audio upload:', path, '; now starting upload...');

        try {
            const result = await StorageController.Instance.uploadFileFromBlob(data.file, path, progressCallback, metadata);
            data.audioMeta.bytesSize = result.size;

            // create
            const session: ClientSessionEntry = {
                date: Date.now(),
                audioMeta: data.audioMeta,
                transcription: null,
                auidioRef: result.ref,
                image: null,
                name: getFilename(data.file),
            };

            await Firebase.Instance.getFunction(CoachesFunctions.CreateSession)
                .execute({ session: session, clientCardId: this.clientCardId });

        } catch (err) {
            logger.warn('Error during file upload:');
            logger.error(err);
            return null;
        }
    }

    async delete(sessionId: string): Promise<DeleteResult> {
        let existing = this._entries.find(s => s.id === sessionId);
        if (!existing) {
            throw new Error('Session entry not found');
        }

        existing = await RepoFactory.Instance.clientCards.deleteSession(this.coachId, this.clientCardId, sessionId);
        if (!existing) {
            return {
                ok: false,
                recordOk: false,
                error: 'Session entry not found',
            };
        }

        if (existing.auidioRef) {
            await StorageController.Instance.deleteFile(existing.auidioRef);
        }
        if (existing.image?.storageRef) {
            await StorageController.Instance.deleteFile(existing.image.storageRef);
        }

        const record = await this.findRecord(sessionId);

        if (!record) {
            return {
                ok: true,
                recordOk: false,
                error: 'Session record not found',
            };
        }

        const recordOk = await RepoFactory.Instance.records.delete(record.id);

        logger.log('Successfully deleted session RECORD:', record.id, record.type);

        return {
            ok: true,
            recordOk: recordOk,
        };
    }
}
