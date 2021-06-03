import firebase from 'firebase';
import Firebase from 'common/services/firebase';
import { createLogger } from 'common/logger';
import Lazy from 'common/utils/lazy';

type FileMetadata = firebase.storage.UploadMetadata;

const logger = createLogger('[Storage]');

export type FileUploadResult = {
    ref: string,
    size: number,
};

export type UpdateMetadataResult = {
    status: boolean,
    metadata: FileMetadata,
};

export type ProgressListener = (progress: number) => void;

const NoOp = () => { /* no-op */ };

export interface IStorageController {
    getFileDownloadUlr(refPath: string): Promise<string>;

    uploadFileFromLocalUri(uri: string, storagePath: string, progess?: ProgressListener): Promise<FileUploadResult>;
    uploadFileFromBlob(blob: Blob, storagePath: string, progress?: ProgressListener, metadata?: FileMetadata): Promise<FileUploadResult>;

    generateFileNameByDate(dotExtension: string): string;

    updateFileMetadata(storagePath: string, metadata: FileMetadata): Promise<UpdateMetadataResult>;
    deleteFile(storagePath: string): Promise<boolean>;
}

function formatDate(date: Date) {
    const pad = (n: number, count = 2) => n.toString().padStart(count, '0');

    const y = pad(date.getUTCFullYear(), 4);
    const m = pad(date.getUTCMonth() + 1);
    const d = pad(date.getUTCDate());

    const hr = pad(date.getUTCHours());
    const min = pad(date.getUTCMinutes());
    const sec = pad(date.getUTCSeconds());

    return `${y}.${m}.${d}_${hr}.${min}.${sec}`;
}

export class StorageController implements IStorageController {

    private _downloadUrlsCache: { [ref: string]: string } = { };

    private static _instance = new Lazy(() => new StorageController());

    public static get Instance() { return StorageController._instance.value; }

    async getFileDownloadUlr(refPath: string): Promise<string> {
        const cached = this._downloadUrlsCache[refPath];
        if (cached) {
            return cached;
        }

        try {
            const ref = Firebase.Instance.storage.ref(refPath);
            const url = await ref.getDownloadURL();

            this._downloadUrlsCache[refPath] = url;

            return url as string;
        } catch (err) {
            logger.warn('File for ref', refPath, 'was not found');
            return null;
        }
    }

    generateFileNameByDate(dotExtension: string): string {
        const now = new Date();
        const nowStr = formatDate(now);

        const filename = `${nowStr}${dotExtension}`;
        return filename;
    }

    private async processTask(uploadTask: firebase.storage.UploadTask, pp: ProgressListener) {
        pp(0);

        uploadTask.on(Firebase.Instance.StorageEvent, snapshot => {
            const progress = snapshot.totalBytes > 0
                ? snapshot.bytesTransferred / snapshot.totalBytes
                : 0;
            pp(progress);
        });

        const res = await uploadTask;
        logger.log('File Uploaded! Result:', {
            url: res.downloadURL,
            size: res.totalBytes,
        });

        pp(1);

        return res;
    }

    async uploadFileFromLocalUri(uri: string, storagePath: string, progress: ProgressListener = null) {
        const pp = progress || NoOp;
        pp(0);

        const f = await fetch(uri);
        const blob = await f.blob();

        const res = await this.uploadFileFromBlob(blob, storagePath, progress);
        return res;
    }

    async uploadFileFromBlob(blob: Blob, storagePath: string, progress: ProgressListener = null, metadata = {}) {
        const pp = progress || NoOp;

        const fileRef = Firebase.Instance.storage.ref(storagePath);
        const uploadTask = fileRef.put(blob, metadata);

        const res = await this.processTask(uploadTask, pp);

        return {
            ref: fileRef.fullPath,
            size: res.totalBytes,
        };
    }

    async updateFileMetadata(storagePath: string, metadata = {}) {
        const fileRef = Firebase.Instance.storage.ref(storagePath);
        const result = await fileRef.updateMetadata(metadata).catch(error => error.message);
        const isError = typeof result === 'string';

        return {
            status: !isError,
            metadata: isError ? null : result,
        };
    }

    async deleteFile(storagePath: string): Promise<boolean> {
        const fileRef = Firebase.Instance.storage.ref(storagePath);
        const result = await fileRef.delete().catch(error => error.message);
        const isError = typeof result === 'string';

        return !isError;
    }
}
