import * as Path from 'path';
import * as OS from 'os';
import * as FS from 'fs';
import * as Stream from 'stream';
import * as CloudStorage from 'server/services/storage';
import { createLogger } from 'common/logger';
import { waitForStreamEndAsync } from 'server/utils/streamHelper';

export function getTempFilePath(filename: string) {
    const dir = OS.tmpdir();
    return Path.join(dir, filename);
}

const extractFileName = (path: string) => {
    const p = Path.parse(path);
    return `${p.name}${p.ext}`;
};

const logger = createLogger('[TemporaryFile]');

export class TemporaryFile<T = any> {

    readonly localPath: string;
    readonly name: string;

    private _writeStream: FS.WriteStream;

    public metadata: T;

    constructor(readonly remotePath: string, private _isLocal = false, private _isRemote = false) {
        this.name = extractFileName(remotePath);
        this.localPath = getTempFilePath(this.name);
    }

    get isLocal() { return this._isLocal; }
    get isRemote() { return this._isRemote; }

    async checkIsRemote(force = false) {
        if (!force && this._isRemote) {
            return true;
        }

        this._isRemote = await CloudStorage.checkExists(this.remotePath);
        return this._isRemote;
    }

    createDownloadStream() {
        if (!this._isRemote) {
            throw new Error('TemporaryFile.createDownloadStream: file is not remote');
        }

        return CloudStorage.createDownloadStream(this.remotePath);
    }

    async download() {
        if (!this._isRemote) {
            throw new Error('TemporaryFile.download: file is not remote');
        }

        logger.log('downloading', this.remotePath, 'to tmp file path:', this.localPath);

        const downloadStream = this.createDownloadStream();
        downloadStream.pipe(this.createWriteStream(), { end: true });
        await waitForStreamEndAsync(downloadStream);
    }

    createUploadAndWriteStream(mimeType: string) {
        const destinationStream = new Stream.PassThrough();

        const storageStream = CloudStorage.createUploadStream(this.remotePath, mimeType);

        storageStream.on('finish', () => {
            this._isRemote = true;
        });

        const fsStream = this.createWriteStream();

        destinationStream.pipe(storageStream, { end: true });
        destinationStream.pipe(fsStream, { end: true });

        return destinationStream;
    }

    createWriteStream() {
        if (!this._writeStream) {
            this._writeStream = FS.createWriteStream(this.localPath);

            this._writeStream.on('end', () => {
                this._isLocal = true;
                this._writeStream = null;
            });
        }

        // throw new Error('WriteStream opened already for path: ' + this.path);
        return this._writeStream;
    }

    createReadStream() {
        if (!this._isLocal) {
            throw new Error('TemporaryFile.createReadStream');
        }

        return FS.createReadStream(this.localPath);
    }

    getBuffer() {
        if (!this._isLocal) {
            throw new Error('TemporaryFile.createReadStream');
        }
        return FS.readFileSync(this.localPath);
    }

    getBase64(): string {
        if (!this._isLocal) {
            throw new Error('TemporaryFile.createReadStream');
        }
        return FS.readFileSync(this.localPath, { encoding: 'base64' });
    }

    dispose() {
        FS.unlinkSync(this.localPath);
        this._isLocal = false;
    }
}
