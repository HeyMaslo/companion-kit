import { observable, computed } from 'mobx';
import logger from 'common/logger';
import { DocumentEntryIded, DocumentPresentationType, DocumentLinkShareStatuses, DocumentLinkShareState } from 'common/models';
import DocsFormVM from 'app/viewModels/components/DocsFormViewModel';
import { getDocumentMetadata } from 'app/utils/getFileMetadata';
import { fileTypeByExtension } from 'app/helpers/files';

import { downloadFile } from 'app/utils/downloadFile';
import AppController from 'app/controllers';
import { ClientModel } from 'app/controllers/ClientModel';
import { StorageReferenceViewModel } from 'common/viewModels/StorageReferenceViewModel';
import { formatDate } from 'common/utils/dateHelpers';

import { PushToast } from 'app/viewModels/ToasterViewModel';

export class DocumentItem {
    @observable
    private _loading: boolean;

    constructor(
        protected readonly entry: DocumentEntryIded,
        private readonly _clientGetter: () => ClientModel,
    ) {}

    protected get client() { return this._clientGetter(); }

    public get loading() {return this._loading; }

    get id() { return this.entry.id; }
    get isLink() { return this.entry.type === 'link'; }
    get name() { return this.entry.name; }

    @computed
    get type() {
        if (this.entry.type === 'link') {
            return DocumentPresentationType.link;
        }

        const ext = `.${this.entry.documentMeta.format}`;
        return fileTypeByExtension(ext);
    }

    get extension() {
        if (this.entry.type === 'link') {
            return 'link';
        }

        return this.entry.documentMeta.format;
    }

    get shareStatus() {
        if (this.entry.type !== 'link') {
            return undefined;
        }

        if (DocumentLinkShareState.isExpired(this.entry.share)) {
            return 'expired';
        }

        return this.entry.share?.status || null;
    }

    get shareStatusText() {
        const d = (this.entry.type === 'link' && this.entry.share?.date) || Date.now();
        switch (this.shareStatus) {
            case 'expired': {
                return `Expired  on ${formatDate(d + DocumentLinkShareState.ExpirationTimeoutMs)}`;
            }

            case DocumentLinkShareStatuses.Sent: {
                return `Sent on ${formatDate(d)}`;
            }

            case DocumentLinkShareStatuses.Opened: {
                return `Last opened on ${formatDate(d)}`;
            }

            default: {
                return '';
            }
        }
    }

    get shareAction() {
        switch (this.shareStatus) {
            case DocumentLinkShareStatuses.Sent:
            case DocumentLinkShareStatuses.Opened: {
                return 'Cancel';
            }

            case 'expired': {
                return 'Send again';
            }

            case undefined: {
                return undefined;
            }

            default: {
                return 'Send to client';
            }
        }
    }

    public removeDocument = () => {
        AppController.Instance.PromptModal.openModal({
            typeModal: 'negative',
            title: 'Are you sure you want *to delete this document?*',
            message: 'The entry and all processed data will be deleted permanently.',
            confirmText: 'Delete',
            rejectText: 'decline',
            onConfirm: this.doRemoveDocument,
        });
    }

    private doRemoveDocument = async () => {
        try {
            this._loading = true;

            const result = await this.client.documents.delete(this.entry.id);

            if (!result.status) {
                logger.error('Failed to delete document:', result.error);
                return;
            }

        } catch (err) {
            logger.error('Unexpected error during document deletion:', err);
        } finally {
            this._loading = false;
        }
    }

    public downloadDocument = async () => {
        try {
            if (this.entry.type !== 'file') {
                window.open(this.entry.link, '_blank');
                return;
            }

            const fileUrl = await AppController.Instance.Storage.getFileDownloadUlr(this.entry.fileRef);
            const filename = `${this.name}.${this.extension}`;

            downloadFile(fileUrl, filename);
        } catch (err) {
            logger.error('Failed to downloadFile:', err);
        }
    }

    public doShareLinkDocument = async () => {
        switch (this.shareAction) {
            case 'Cancel': {
                await this.client.documents.changeShareStatus(this.entry.id, DocumentLinkShareStatuses.Revoked);
                PushToast({ text: `Link has been revoked` });
                return;
            }

            case 'Send again':
            case 'Send to client': {
                await this.client.documents.changeShareStatus(this.entry.id, DocumentLinkShareStatuses.Sent);
                PushToast({ text: `Sent to ${this.client.displayName}` });
                return;
            }

            default: {
                return;
            }
        }
    }
}

export default class DocsPageViewModel {
    @observable
    private _error: string = null;

    @observable
    private _uploadProgress: number = null;

    @observable
    private _loading: boolean = false;

    @observable
    private _formatError: boolean = false;

    constructor(private readonly _clientGetter: () => ClientModel) {}

    @computed
    get list(): ReadonlyArray<DocumentItem> {
        const documentsEntries = this.model.documents.entries;

        return documentsEntries.map(e => new DocumentItem(e, this._clientGetter));
    }

    private get model() { return this._clientGetter(); }

    get formatError() { return this._formatError; }

    set formatError(val: boolean) { this._formatError = val; }

    get error() { return this._error || this.form.error; }

    get loading() { return this._loading || this.form.loading || this.list.some(doc => doc.loading); }

    get clientId() {
        return this.model.card.id;
    }

    get clientName() {
        return this.model.card.firstName && this.model.card.lastName
            ? `${this.model.card.firstName} ${this.model.card.lastName}`
            : null;
    }

    get uploadProgress() { return this._uploadProgress; }
    get inProgress() { return this.form.loading || (this.list.findIndex(s => s.loading) > -1); }

    form = new DocsFormVM(() => this.model);

    @computed
    get images() {
        return this.model.journal.images.map(i => ({
            image: new StorageReferenceViewModel(i.ref.storageRef),
            caption: i.entry.question,
        }));
    }

    public uploadFile = async (payload: { file: File }) => {
        if (!payload.file.type) {
            this.formatError = true;
            return;
        }

        this._uploadProgress = 0;

        try {
            const metadata = await getDocumentMetadata(payload.file);

            logger.log('uploadDocument: metadata:', metadata);

            await this.model.documents.create({
                file: payload.file,
                documentMeta: metadata,
                type: 'file',
            }, p => { this._uploadProgress = p; });
        } catch (err) {
            this._error = err.message;
            logger.error('Failed to upload document file:', err);
        } finally {
            this._uploadProgress = null;
        }
    }
}
