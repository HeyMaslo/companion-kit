import { createLogger } from 'common/logger';
import Firebase from 'common/services/firebase';
import { Clients as ClientsFunctions } from 'common/abstractions/functions';
import {
    ClientJournalEntryIded,
    ClientJournalEntry,
    JournalRecordDataIded,
} from 'common/models';
import Paths from 'common/storage/paths';
import { JournalController as JournalControllerBase } from 'common/controllers/JournalController';
import {
    StorageController,
    ProgressListener,
} from 'common/controllers/StorageController';
import RepoFactory from 'common/controllers/RepoFactory';

const logger = createLogger('[JournalController]');

const FAKE_UPLOAD = false;

export interface IJournalController {
    readonly entries: ReadonlyArray<ClientJournalEntryIded>;

    readonly loading: boolean;

    addEntry(entry: ClientJournalEntry): Promise<ClientJournalEntryIded>;
    deleteEntry(entryId: string): Promise<void>;
    editEntryPrivacy(
        entryId: string,
        priv: boolean,
    ): Promise<ClientJournalEntryIded>;

    uploadEntryFile(
        localUri: string,
        type: 'audio' | 'image',
        progressCallback?: ProgressListener,
    ): Promise<{ ref: string; size: number }>;

    findRecord(entryId: string): Promise<JournalRecordDataIded>;
}

export class JournalController
    extends JournalControllerBase
    implements IJournalController {
    async addEntry(entry: ClientJournalEntry): Promise<ClientJournalEntryIded> {
        let result: ClientJournalEntryIded;
        if (FAKE_UPLOAD) {
            // TODO That's a holy stub
            result = entry as ClientJournalEntryIded;
            result.id = `${Math.random() * 100000}`;
        } else {
            result = await Firebase.Instance.getFunction(
                ClientsFunctions.UploadJournal,
            ).execute({ entry, accountId: this._clientCardId });
        }

        return result;
    }

    async deleteEntry(entryId: string): Promise<void> {
        const deleted = await RepoFactory.Instance.clients.deleteJournalEntry(
            this._clientUid,
            this._clientCardId,
            entryId,
        );
        if (!deleted) {
            throw new Error('Not Found');
        }

        logger.log(
            'Successfully deleted journal entry:',
            deleted.id,
            new Date(deleted.date),
        );

        const record = await this.findRecord(entryId);

        if (!record) {
            throw new Error('Record not found');
        }

        await RepoFactory.Instance.records.delete(record.id);

        logger.log(
            'Successfully deleted journal RECORD:',
            record.id,
            record.type,
        );

        // Delete audio and/or image
        if (deleted.auidioRef) {
            await StorageController.Instance.deleteFile(deleted.auidioRef);
        }
        if (deleted.image?.storageRef) {
            await StorageController.Instance.deleteFile(
                deleted.image.storageRef,
            );
        }
    }

    async editEntryPrivacy(
        entryId: string,
        priv: boolean,
    ): Promise<ClientJournalEntryIded> {
        const res = await Firebase.Instance.getFunction(
            ClientsFunctions.EditJournalPrivacy,
        ).execute({
            accountId: this._clientCardId,
            entryId: entryId,
            diff: { private: priv },
        });

        return res;
    }

    async uploadEntryFile(
        localUri: string,
        type: 'audio' | 'image',
        progressCallback?: ProgressListener,
    ): Promise<{ ref: string; size: number }> {
        if (!this._clientUid || !this._clientCardId) {
            throw new Error(
                `Cannot upload an ${type}: uid & account must be set`,
            );
        }

        const lastDot = localUri.lastIndexOf('.');
        const extension = localUri.substring(lastDot);

        const filename = StorageController.Instance.generateFileNameByDate(
            extension,
        );
        const path = Paths.getJournalEntryPath(
            this._coachUid,
            this._clientCardId,
            filename,
        );

        logger.log(
            'Constructed path for',
            type,
            'upload:',
            path,
            '; now starting upload...',
        );

        try {
            const result = await StorageController.Instance.uploadFileFromLocalUri(
                localUri,
                path,
                progressCallback,
            );
            return result;
        } catch (err) {
            logger.warn('Error during file upload:');
            logger.error(err);
            return null;
        }
    }
}
