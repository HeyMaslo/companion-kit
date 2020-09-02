import { observable } from 'mobx';
import { ClientModel } from 'app/controllers/ClientModel';
import { TextInputVM, ValidatableViewModel } from 'common/viewModels';
import * as Validations from 'common/utils/validation';
import Localization from 'app/services/localization';
import logger from 'common/logger';

export default class DocsFormVM {
    @observable
    private _documentId: string = null;

    @observable
    private _error: string = null;

    @observable
    private _loading: boolean = false;

    constructor(private readonly _clientGetter: () => ClientModel) {}

    private get model() { return this._clientGetter(); }

    get documentId() { return this._documentId; }

    set documentId(val: string) {
        this._documentId = val;
    }

    get error() { return this._error; }

    get loading() { return this._loading; }

    docName = new TextInputVM({
        name: 'docName',
        trimOnValidate: false,
        validation: {
            validator: Validations.Validators.textLength,
            errors: Localization.ValidationErrors,
            accessor: error => error.replace('{length}', '255'),
        },
    });

    link = new TextInputVM({
        name: 'link',
        trimOnValidate: true,
        validation: {
            validator: Validations.Validators.url,
            errors: Localization.ValidationErrors,
        },
    });

    private addLink = async (): Promise<{ok: boolean}> => {
        this._error = null;

        if (await ValidatableViewModel.IsSomeInvalid([this.docName, this.link], false)) {
            return;
        }

        this._loading = true;

        try {
            await this.model.documents.create({
                name: this.docName.value,
                link: this.link.value,
                type: 'link',
            });

            return {ok: true};
        } catch (err) {
            logger.warn('[ERROR]: ', err);
            this._error = err.message;

            return {ok: false};
        } finally {
            this._loading = false;
        }
    }

    private renameDocument = async (): Promise<{ok: boolean}> => {
        this._error = null;

        try {
            if (await ValidatableViewModel.IsSomeInvalid([this.docName], false)) {
                return;
            }

            this._loading = true;

            await this.model.documents.editDocumentName(this.documentId, this.docName.value);

            return {ok: true};
        } catch (err) {
            this._error = err.message;
            logger.error('Failed to renameFile:', err);

            return {ok: false};
        } finally {
            this._loading = false;
        }
    }

    public submit = async () => {
        if (this.documentId) {
            const resp = await this.renameDocument();
            return resp.ok;
        }

        const res = await this.addLink();
        return res.ok;
    }

    public reset = () => {
        this.docName.reset();
        this.link.reset();
        this.documentId = null;
    }
}
