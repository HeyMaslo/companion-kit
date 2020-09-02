import { TextInputVM, ValidatableViewModel } from 'common/viewModels';
import * as Validations from 'common/utils/validation';
import Localization from '../services/localization';
import { observable, computed, reaction } from 'mobx';
import Lazy from 'common/utils/lazy';
import { UserProfile } from 'common/models';
import NamesHelper from 'common/utils/nameHelper';
import logger from 'common/logger';
import AppController from 'app/controllers';
import CreditCardViewModel from './CreditCard';
import { AuthErrors } from 'common/abstractions/controlllers/IAuthController';
import { MagicLinkRequestReasons } from 'common/models/dtos/auth';
import { PushToast } from './ToasterViewModel';
import History from 'app/services/history';
import * as Routes from 'app/constants/routes';
import { Dashboard as DashboardFeatures } from 'common/constants/features';
import { createPhoneValidator } from 'app/utils/moduleWrappers';

const instance = new Lazy(() => new ProfileViewModel());

export default class ProfileViewModel {
    static Prewarm() {
        instance.prewarm();
    }

    @observable
    private _passwordsError: string = null;

    @observable
    private _inProgress: boolean = false;

    readonly email = new TextInputVM({
        name: 'email',
        trimOnValidate: true,
        validation: {
            validator: Validations.Validators.email,
            errors: Localization.ValidationErrors,
        },
    });

    readonly name = new TextInputVM({
        name: 'fullname',
        trimOnValidate: true,
        validation: {
            validator: Validations.Validators.notEmpty,
            errors: Localization.ValidationErrors,
        },
    });

    readonly bio = new TextInputVM({
        name: 'bio',
        trimOnValidate: true,
    });

    readonly oldPassword = new TextInputVM({
        name: 'oldPassword',
        validation: {
            validator: Validations.Validators.notEmpty,
            errors: Localization.ValidationErrors,
        },
    });

    readonly newPassword = new TextInputVM({
        name: 'newPassword',
        validation: {
            validator: Validations.Validators.password,
            errors: Localization.ValidationErrors,
        },
    });

    private readonly _phoneValidator = createPhoneValidator(DashboardFeatures.UseMobileNumber?.countries);

    readonly mobileNumber = DashboardFeatures.UseMobileNumber ? new TextInputVM({
        name: 'mobileNumber',
        validation: {
            validator: this._phoneValidator.validator,
            errors: Localization.ValidationErrors,
        },
        formatterHook: s => this._phoneValidator.setValue(s),
    }) : null;

    readonly officeNumber = DashboardFeatures.UseMobileNumber ? new TextInputVM({
        name: 'officeNumber',
        validation: {
            validator: Validations.Wrappers.notRequired(this._phoneValidator.validator),
            errors: Localization.ValidationErrors,
        },
        formatterHook: s => this._phoneValidator.setValue(s),
    }) : null;

    readonly creditCard = new CreditCardViewModel();

    static get Instance() { return instance.value; }

    constructor() {
        reaction(_ => this.user?.coach, this.resetProfileFields, { fireImmediately: true });
    }

    get user() { return AppController.Instance.User.user; }
    get last4() { return this.user && this.user.billing && this.user.billing.last4; }
    get passwordsError() { return this._passwordsError; }
    get inProgress() { return this._inProgress; }

    get isFreeAccess() { return !!this.user?.freeAccess; }

    get needsCreatePassword() { return AppController.Instance.Auth.needsCreatePassword === true; }
    get disablePassword() { return AppController.Instance.Auth.needsCreatePassword == null; }

    get organization() { return this.user?.coach?.organization; }

    @computed
    get editingPhoneNumbers() {
        return (this.user?.phone || '') !== this.mobileNumber?.value
            || (this.user?.coach?.officeNumber || '') !== this.officeNumber?.value;
    }

    public signOut = () => {
        return AppController.Instance.Auth.signOut();
    }

    public resetPersonalInfo = () => {
        this.resetProfileFields();
    }

    public savePersonalInfoAsync = async () => {
        if (await ValidatableViewModel.IsSomeInvalid([this.name])) {
            this.resetProfileFields();
            return;
        }

        const upd: Partial<UserProfile> = { };

        const u = this.user;
        if (this.name.value !== u.displayName) {
            upd.displayName = this.name.value;

            Object.assign(upd, NamesHelper.split(upd));
        }

        if (this.bio.value !== u.bio) {
            upd.bio = this.bio.value;
        }

        try {
            this._inProgress = true;
            await AppController.Instance.User.editProfile(upd);
        } finally {
            this._inProgress = false;
        }
    }

    public saveAvatar = async (base64url: string) => {
        try {
            await AppController.Instance.User.saveAvatar(base64url);
        } catch (err) {
            logger.error('Failed to upload avatar', err);
        }
    }

    public createPassword = () => {
        AppController.Instance.Auth.enableCreatePasswordMode();
    }

    public savePassword = async () => {
        this._inProgress = true;

        try {
            const passwords = [this.oldPassword, this.newPassword];

            this._passwordsError = null;
            if (await ValidatableViewModel.IsSomeInvalid(passwords)) {
                return;
            }

            const result = await AppController.Instance.Auth.updatePassword(this.newPassword.value, this.oldPassword.value);
            if (result?.result === true) {
                passwords.forEach(vm => vm.reset());
                PushToast({ text: 'Your password has been changed successfully' });
                return;
            }

            if (result.error === AuthErrors.WrongPassword) {
                this._passwordsError = 'The old password is invalid';
            } else {
                this._passwordsError = Localization.Current.FirebaseErrors[result.original?.code]
                    || result.original.message || 'Unknown error occured';
            }

        } finally {
            this._inProgress = false;
        }
    }

    public forgotPassword = async () => {
        if (this._inProgress) {
            return false;
        }

        this._passwordsError = null;
        this._inProgress = true;
        try {
            await AppController.Instance.Auth.signInWithEmailLink(this.email.value, MagicLinkRequestReasons.PasswordReset);
            History.push(Routes.CheckYourEmail_PasswordReset);
            return true;
        } catch (err) {
            this._passwordsError = err.message;
            return false;
        } finally {
            this._inProgress = false;
        }
    }

    public savePhones = async () => {
        if (!DashboardFeatures.UseMobileNumber) {
            return;
        }

        if (await ValidatableViewModel.IsSomeInvalid([this.mobileNumber, this.officeNumber])) {
            return;
        }

        try {
            this._inProgress = true;
            if (this.mobileNumber?.value !== this.user.phone) {
                await AppController.Instance.User.editProfile({ phone: this.mobileNumber.value });
            }

            if (this.officeNumber.value !== this.user.coach.officeNumber) {
                await AppController.Instance.User.editCoachProfile({ officeNumber: this.officeNumber.value });
            }
        } finally {
            this.resetProfileFields();
            this._inProgress = false;
        }
    }

    public resetPhones = () => {
        [this.mobileNumber, this.officeNumber]
            .forEach(n => n?.resetError());
        this.resetProfileFields();
    }

    private resetProfileFields = () => {
        const u = this.user;
        this.email.value = u ? u.email : '';
        this.name.value = u ? u.displayName : '';
        this.bio.value = u ? u.bio : '';
        if (this.mobileNumber) {
            this.mobileNumber.value = u ? u.phone : '';
        }
        if (this.officeNumber) {
            this.officeNumber.value = u?.coach ? u.coach.officeNumber : '';
        }

        this.newPassword.reset();
        this.oldPassword.reset();
    }
}
