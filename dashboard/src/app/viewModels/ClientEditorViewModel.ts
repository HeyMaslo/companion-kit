import { observable, computed, transaction, reaction } from 'mobx';
import logger from 'common/logger';
import { TextInputVM, ValidatableViewModel, DateViewModel, IValidatable, IResetable } from 'common/viewModels';
import { ClientCard, CoachClientActions, ClientStatus } from 'common/models';
import * as Validations from 'common/utils/validation';
import History from 'app/services/history';
import * as Routes from 'app/constants/routes';
import Localization from 'app/services/localization';
import AppController from 'app/controllers';
import CaretakerForm from 'app/viewModels/components/CaretakerForm';
import { ClientCardFeatures } from 'common/constants/features';

export default class ClientEditorViewModel {
    @observable
    private _error: string = null;

    @observable
    private _inProgress: boolean = false;

    @observable
    private _clientId: string = null;

    get isInvitation() { return this.client.status === ClientStatus.Invited; }

    caretaker = new CaretakerForm(false);
    extraCaretaker = new CaretakerForm(false);

    diagnosisFirst = new TextInputVM();
    diagnosisSecond = new TextInputVM();
    diagnosisThird = new TextInputVM();

    firstName = new TextInputVM({
        name: 'firstName',
        trimOnValidate: true,
        validation: {
            validator: Validations.Validators.firstName,
            errors: Localization.ValidationErrors,
        },
    });

    lastName = new TextInputVM({
        name: 'lastName',
        trimOnValidate: true,
        validation: {
            validator: Validations.Validators.lastName,
            errors: Localization.ValidationErrors,
        },
    });

    email = new TextInputVM({
        name: 'email',
        trimOnValidate: true,
        validation: {
            validator: Validations.Validators.email,
            errors: Localization.ValidationErrors,
        },
    });

    birthday = new DateViewModel({
        validation: {
            validator: Validations.Validators.birthday,
            errors: Localization.ValidationErrors,
        },
    });

    occupation = new TextInputVM({
        name: 'occupation',
        trimOnValidate: true,
        validation: {
            validator: Validations.Validators.occupation,
            errors: Localization.ValidationErrors,
        },
    });

    phone = new TextInputVM({
        trimOnValidate: true,
        name: 'phone',
        validation: {
            validator: Validations.Validators.notEmpty,
            errors: Localization.ValidationErrors,
        },
    });

    nickname = new TextInputVM({
        trimOnValidate: true,
        name: 'nickname',
    });

    externalPatientId = new TextInputVM({
        trimOnValidate: true,
        name: 'externalPatientId',
    });

    description = new TextInputVM({
        trimOnValidate: true,
        name: 'description',
    });

    private get allFields(): (IValidatable & IResetable)[] {
        const fields: (IValidatable & IResetable)[] = [
            this.firstName, this.lastName, this.email, this.phone, this.description,
        ];

        if (process.appFeatures.CLIENT_CARETAKERS_ENABLED) {
            fields.push(this.birthday);
        } else if (ClientCardFeatures.UseOccupation) {
            fields.push(this.occupation);
        }

        return fields;
    }

    private _unsubscribe: () => void = null;

    constructor() {
        this._unsubscribe = reaction(_ => this.client, c => {
            transaction(() => {
                if (!c || !c.id) {
                    this.resetAllFields();
                } else {
                    this._fillUserInfo();
                }
            });
        });
    }

    get error() { return this._error; }

    get inProgress() { return this._inProgress; }

    get isEditMode() { return !!this._clientId; }

    get isEmailChanged() { return this.email.value !== this.client?.email; }

    public setClientId = (id: string) => {
        if (id === this._clientId) {
            return;
        }

        this._clientId = id;
    }

    @computed
    get currentModel() { return AppController.Instance.User.clients.getModel(this._clientId); }

    get client() { return this.currentModel.card; }

    get publicAllFields() { return this.allFields; }

    private _fillUserInfo() {
        this.firstName.value = this.client.firstName;
        this.lastName.value = this.client.lastName;
        this.description.value = this.client.description;
        this.email.value = this.client.email;
        this.occupation.value = this.client.occupation;
        this.phone.value = this.client.phone;
        this.caretaker.fillCaretaker(this.client.caretaker);
        this.extraCaretaker.fillCaretaker(this.client.extraCaretaker);
        this.birthday.value = this.client.birthday ? new Date(this.client.birthday) : null;
        this.externalPatientId.value = this.client.externalPatientId ? this.client.externalPatientId : null;
        this.nickname.value = this.client.nickname ? this.client.nickname : null;

        // console.log(process.appFeatures.COACH_TIME_TRACKING_ENABLED && this.client.diagnosis?.length);
        if (process.appFeatures.COACH_TIME_TRACKING_ENABLED && this.client.diagnosis?.length) {
            this.diagnosisFirst.value = this.client.diagnosis[0];
            this.diagnosisSecond.value = this.client.diagnosis[1];
            this.diagnosisThird.value = this.client.diagnosis[2];
        }

        this._error = null;
    }

    resetAllFields() {
        this._error = null;

        this.caretaker.resetAllFields();
        this.extraCaretaker.resetAllFields();

        this.allFields.forEach(field => {
            field.reset();
        });
    }

    submit = () => {
        return this.isEditMode
            ? this.editClientSubmit()
            : this.addClientSubmit();
    }

    private editClientSubmit = async () => {
        this._error = '';

        if (!this._clientId) {
            this._error = 'Invalid action';
            return;
        }

        const isValid = await this.validate();
        if (!isValid) {
            return {ok: false};
        }

        try {
            this._inProgress = true;

            await AppController.Instance.User.clients.action(
                this._clientId,
                CoachClientActions.Edit,
                this.actionData);

            window.scrollTo(0, 0);
            History.replace(Routes.ClientDetails(this._clientId, Routes.ClientDetails.Tabs.view));
            return {ok: true};
        } catch (err) {
            this._error = err.message;
            return {ok: false};
        } finally {
            this._inProgress = false;
        }
    }

    private validate = async () => {
        const caretakerValid =
            !process.appFeatures.CLIENT_CARETAKERS_ENABLED || (await this.caretaker.validate() && await this.extraCaretaker.validate());
        const clientInvalid = await ValidatableViewModel.IsSomeInvalid(this.allFields, false);

        return caretakerValid && !clientInvalid;
    }

    private get actionData() {
        const data: Partial<ClientCard> = {
            firstName: this.firstName.value,
            lastName: this.lastName.value,
            phone: this.phone.value,
            description: this.description.value,
            email: this.email.value,
        };

        if (ClientCardFeatures.UseTherapistClientInfo) {
            data.birthday = this.birthday.value ? new Date(this.birthday.value).getTime() : null;
            data.externalPatientId = this.externalPatientId.value ? this.externalPatientId.value : null;
            data.nickname = this.nickname.value ? this.nickname.value : null;
        }

        if (process.appFeatures.COACH_TIME_TRACKING_ENABLED) {
            data.diagnosis = [
                this.diagnosisFirst.value,
                this.diagnosisSecond.value,
                this.diagnosisThird.value,
            ];
        }

        return process.appFeatures.CLIENT_CARETAKERS_ENABLED ? {
            ...data,
            caretaker: this.caretaker.getData(),
            extraCaretaker: this.extraCaretaker.getData(),
        } : {
            ...data,
            occupation: this.occupation.value,
        };
    }

    private addClientSubmit = async () => {
        this._error = '';

        const isValid = await this.validate();
        if (!isValid) {
            return {ok: false};
        }

        this._inProgress = true;

        try {

            await AppController.Instance.User.clients.add(this.actionData);

            History.replace(Routes.AddNewClientSuccess);
            return {ok: true};
        } catch (err) {
            logger.warn('[ERROR]: ', err);
            this._error = err.message;
            return {ok: false};
        } finally {
            this._inProgress = false;
        }
    }

    dispose = () => {
        if (this._unsubscribe) {
            this._unsubscribe();
            this._unsubscribe = null;
        }
    }

    promptToDelete = () => {
        if (this.isInvitation) {
            AppController.Instance.PromptModal.openModal({
                typeModal: 'negative',
                title: 'Do you really want *to delete invite?*',
                message: '',
                confirmText: 'Delete',
                rejectText: 'decline',
                onConfirm: this.deleteInvitation,
                onReject: () => {
                    AppController.Instance.PromptModal.closeModal();
                },
            });
        } else {
            AppController.Instance.PromptModal.openModal({
                typeModal: 'negative',
                title: `Do you really want to deactivate ${this.client.firstName} ${this.client.lastName}’s account`,
                message: Localization.Current.DashboardProject.clientEditor.deactivateAccountMessage,
                confirmText: 'Deactivate account',
                rejectText: 'Cancel',
                onConfirm: this.deactivateClient,
                className: 'delete-client',
            });

        }

    }

    private deactivateClient = async () => {
        this._inProgress = true;

        try {
            await AppController.Instance.User.clients.action(this.client.id, CoachClientActions.Disable);

            History.replace(Routes.Clients);
        } catch (err) {
            logger.error('deactivateClient ERROR:', err);
        } finally {
            this._inProgress = false;
        }
    }

    private deleteInvitation = async () => {
        this._inProgress = true;

        try {
            await AppController.Instance.User.clients.action(this.client.id, CoachClientActions.Archive);

            History.replace(Routes.Clients);
        } catch (err) {
            logger.error('deleteInvitation ERROR:', err);
        } finally {
            this._inProgress = false;
        }
    }
}
