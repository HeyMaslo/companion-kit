import { observable, computed } from 'mobx';
import { ClientModel } from 'app/controllers/ClientModel';
import { SessionItem } from './ClientEntryItem';
import logger from 'common/logger';
import { getAudioMetadata } from 'app/utils/getFileMetadata';
import WebClientTracker, { Events } from 'app/services/webTracker';
import { validateAudioExtension, getFileExtension } from 'app/helpers/files';
import * as ViewModels from 'common/viewModels';
import { ClientSessionEntry, Identify } from 'common/models';
import Firebase from 'common/services/firebase';
import { Coaches } from 'common/abstractions/functions';
import { SessionsEditResponse } from 'common/models/dtos/sessions';
import { StorageController } from 'common/controllers/StorageController';
import * as Validations from 'common/utils/validation';
import { ValidatableViewModel } from 'common/viewModels';
import Localization from 'app/services/localization';

export default class SessionsPageViewModel {
    @observable
    private _activeId: string;

    @observable
    private _wrongExtension: boolean = false;

    @observable
    private _uploadProgress: number = null;

    public readonly form = new EditSessionForm(() => this._clientGetter());

    constructor(private readonly _clientGetter: () => ClientModel) {}

    @computed
    get list(): ReadonlyArray<SessionItem> {
        const sessionsEntries = this.model.sessions ? this.model.sessions.entries : [];
        const list = sessionsEntries.map(
            e => new SessionItem(e, this._clientGetter).onActive(
                () => {
                    this._activeId = e.id;
                    WebClientTracker.Instance?.trackEvent(Events.Play('sessionsPage', this.clientName));
                },
            ),
        );
        return list;
    }

    get activeId() { return this._activeId; }

    get wrongExtension() { return this._wrongExtension; }

    set wrongExtension(val: boolean) {
        this._wrongExtension = val;
    }

    private get model() { return this._clientGetter(); }

    get clientId() {
        return this.model.card.id;
    }

    get clientName() {
        return this.model.card.firstName && this.model.card.lastName
            ? `${this.model.card.firstName} ${this.model.card.lastName}`
            : null;
    }

    get uploadProgress() { return this._uploadProgress; }

    @computed
    get inProgress() { return (this.list.findIndex(s => s.loading) > -1) || this.form.loading; }

    public stopAll = () => {
        this._activeId = undefined;
    }

    public uploadSession = async (payload: { file: File }) => {
        const validExtension = validateAudioExtension(payload.file);

        if (!validExtension) {
            this._wrongExtension = true;
            return;
            // throw new Error('Only mp3 files supported');
        }

        this._uploadProgress = 0;

        try {
            const metadata = await getAudioMetadata(payload.file);
            metadata.format = 'MP3';

            logger.log('uploadSession: audio metadata:', metadata);

            await this.model.sessions?.create({
                file: payload.file,
                dotExtension: getFileExtension(payload.file),
                audioMeta: metadata,
            }, p => { this._uploadProgress = p; });

            WebClientTracker.Instance?.trackEvent(Events.SessionUpload(this.clientName, payload.file.name));
        } catch (err) {
            logger.error('Failed to upload session file:', err);
        } finally {
            this._uploadProgress = null;
        }
    }
}

export class EditSessionForm {
    readonly nameVM = new ViewModels.TextInputVM({
        name: 'sessionName',
        validation: {
            validator: Validations.Validators.textLength,
            errors: Localization.ValidationErrors,
            accessor: error => error.replace('{length}', '255'),
        },
    });

    readonly dateVM = new ViewModels.DateViewModel({
        validation: {
            validator: Validations.Validators.notFutureDate,
            errors: Localization.ValidationErrors,
        },
    });

    private _sessionId: string = null;

    @observable
    public error: string = '';

    @observable
    private _loading: boolean = false;

    constructor(private readonly _clientGetter: () => ClientModel) {}

    set sessionId(id: string) {
        this._sessionId = id;
    }

    get loading() {
        return this._loading;
    }

    submit = async () => {
        const cardId = this._clientGetter().card.id;
        const diff: Partial<ClientSessionEntry> = {};

        if (await ValidatableViewModel.IsSomeInvalid([this.nameVM, this.dateVM], false)) {
            return;
        }

        const changeName = !!this.nameVM.value;
        if (changeName) {
            diff.name = this.nameVM.value;
        }

        if (this.dateVM.value) {
            diff.date = new Date(this.dateVM.value).getTime();
        }

        this._loading = true;
        let res: SessionsEditResponse;

        try {
            res = await Firebase.Instance.getFunction(Coaches.EditSession)
                .execute({ sessionId: this._sessionId, clientCardId: cardId, diff });

            if (res.ok === true && changeName) {
                const entry: Identify<ClientSessionEntry> = res.entry;
                const metadata = {
                    contentDisposition: `attachment; filename="${entry.name}.mp3"`,
                };

                const r = await StorageController.Instance.updateFileMetadata(entry.auidioRef, metadata);
                logger.log('Editing session metadata result', r);
            }

            if (res.ok === false) {
                this.error = res.error;
            }
        } catch (err) {
            this.error = err.message;
        } finally {
            this._loading = false;
        }

        return res;
    }

    reset() {
        this.error = null;
        this.sessionId = null;
        this.nameVM.reset();
        this.dateVM.reset();
    }
}
