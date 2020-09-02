import { DocumentsController as DocumentsControllerBase, logger } from 'common/controllers/DocumentsController';
import { DocumentEntry, DocumentEntryIded, DocumentMeta, DocumentLinkShareStatuses } from 'common/models';
import { Coaches as CoachesFunctions } from 'common/abstractions/functions';
import Firebase from 'common/services/firebase';
import { ProgressListener, StorageController } from 'common/controllers/StorageController';
import Paths from 'common/storage/paths';
import RepoFactory from 'common/controllers/RepoFactory';
import { getFilename } from 'app/helpers/files';

export type UploadDocumentData = {
    documentMeta?: DocumentMeta,
    file?: File,
    name?: string,
    link?: string,
    type: 'file' | 'link',
};

export type DeleteResult = {
    status: boolean,
    error?: Error | string,
};

export interface IDocumentController {
    readonly loading: boolean;
    readonly entries: ReadonlyArray<DocumentEntryIded>;

    getIsEntryExists(entryId: string): boolean;

    create(data: UploadDocumentData, progressCallback?: ProgressListener): Promise<void>;
    editDocumentName(documentId: string, name: string): Promise<DocumentEntryIded>;
    delete(sessionId: string): Promise<DeleteResult>;
    changeShareStatus(documentId: string, status: DocumentLinkShareStatuses): Promise<void>;
}

export class DocumentsController extends DocumentsControllerBase implements IDocumentController {

    async create(data: UploadDocumentData, progressCallback: ProgressListener = null): Promise<void> {
        if (!this.coachId || !this.clientCardId) {
            throw new Error('Not initialized');
        }

        try {
            let document: DocumentEntry;

            if (data.type === 'file') {
                // upload
                const nameByDate = StorageController.Instance.generateFileNameByDate(data.documentMeta.format);
                const path = Paths.getDocumentEntryPath(this.coachId, this.clientCardId, nameByDate);
                const filename = getFilename(data.file);
                const metadata = {
                    contentDisposition: `attachment; filename="${data.file.name}"`,
                    cacheControl: 'no-cache, no-store, must-revalidate',
                };

                logger.log('Constructed path for document upload:', path, '; now starting upload...');

                const result = await StorageController.Instance.uploadFileFromBlob(data.file, path, progressCallback, metadata);
                data.documentMeta.bytesSize = result.size;

                document = {
                    documentMeta: data.documentMeta,
                    fileRef: result.ref,
                    name: filename,
                    type: data.type,
                };
            } else {
                document = {
                    name: data.name,
                    link: data.link,
                    type: data.type,
                };
            }

            await Firebase.Instance.getFunction(CoachesFunctions.CreateDocument)
                .execute({ document, clientCardId: this.clientCardId });

        } catch (err) {
            logger.warn('Error during file upload:');
            logger.error(err);
            return null;
        }
    }

    async editDocumentName(documentId: string, name: string): Promise<DocumentEntryIded> {
        if (!this.coachId || !this.clientCardId) {
            throw new Error('Not initialized');
        }
        try {
            const res = await Firebase.Instance.getFunction(CoachesFunctions.EditDocumentName)
                .execute({clientCardId: this.clientCardId, documentId, diff: {name}});

            if (res.type === 'file') {
                const metadata = {
                    contentDisposition: `attachment; filename="${res.name}.${res.documentMeta.format}"`,
                };

                await StorageController.Instance.updateFileMetadata(res.fileRef, metadata);
            }

            return res;
        } catch (err) {
            logger.warn('Error during document edit:');
            logger.error(err);

            return null;
        }
    }

    async delete(documentId: string): Promise<DeleteResult> {
        let existing = this._entries.find(s => s.id === documentId);
        if (!existing) {
            throw new Error('Document not found');
        }

        existing = await RepoFactory.Instance.clientCards.deleteDocument(this.coachId, this.clientCardId, documentId);
        if (!existing) {
            return {
                status: false,
                error: 'Document not found',
            };
        }

        if (existing.type === 'file') {
            const deleted = await StorageController.Instance.deleteFile(existing.fileRef);

            return {
                status: deleted,
                error: deleted ? null : 'Document not delete from firestore',
            };
        }

        return {
            status: true,
        };
    }

    async changeShareStatus(documentId: string, status: DocumentLinkShareStatuses) {
        const doc = this.entries.find(e => e.id === documentId);
        if (!doc || doc.type !== 'link') {
            throw new Error('Link doc was not found for id = ' + documentId);
        }

        const allowedStatuses = [DocumentLinkShareStatuses.Sent, DocumentLinkShareStatuses.Revoked];

        if (!allowedStatuses.includes(status)) {
            throw new Error(`[DocumentsController] status ${status} is not allowed to be set. Allowed: ${allowedStatuses.join()}`);
        }

        if (doc.share?.status === status) {
            logger.log('Link Doc share status won\'t be changed because it already has status', status);
            return;
        }

        await Firebase.Instance.getFunction(CoachesFunctions.ShareDocumentLink)
            .execute({
                clientCardId: this.clientCardId,
                documentId: documentId,
                status: status,
            });
    }
}
