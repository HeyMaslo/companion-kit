import { observable, transaction } from 'mobx';
import { TextInputVM } from 'common/viewModels';
import * as Validations from 'common/utils/validation';
import { createLogger } from 'common/logger';
import { MagicLinkRequestReasons } from 'common/models/dtos/auth';
import { AuthErrors, IAuthController, AuthProviders, FirebaseError } from 'common/abstractions/controlllers/IAuthController';
import { ILocalizationManager } from 'common/services/localization/LocalizationManager';
import IStorage from 'common/abstractions/services/storage';
import { prepareEmail } from 'common/utils/emails';

export const logger = createLogger('[SignInViewModel]');

export const DemoAccounts = ['demo@maslo.ai'];
const NewPasswordKey = 'signin:newpassword';

export abstract class SignInViewModelBase {

    @observable
    protected _error: string = null;

    @observable
    protected _inProgress = false;

    @observable
    private _needsOldPassword: boolean = null;

    @observable
    protected _isResettingPassword: boolean = false;

    protected isSettingNewPassword = false;

    readonly email = new TextInputVM({
        name: 'email',
        trimOnValidate: true,
        validation: {
            validator: Validations.Validators.email,
            errors: () => this.Localization.ValidationErrors,
        },
    });

    readonly password = new TextInputVM({
        name: 'password',
        validation: {
            validator: v => this.validatePassword(v),
            errors: () => this.Localization.ValidationErrors,
        },
    });

    protected abstract get Auth(): IAuthController;
    protected abstract get Localization(): ILocalizationManager;
    protected abstract get Storage(): IStorage;

    get error() { return this._error; }
    get inProgress() { return this._inProgress; }
    get needsOldPassword() { return this._needsOldPassword; }
    get isResettingPassword() { return this._isResettingPassword; }

    protected validatePassword(val: string): Validations.ValidationErrors {
        return this.isSettingNewPassword
            ? Validations.Validators.password(val)
            : Validations.Validators.notEmpty(val);
    }

    resetPasswordInput() {
        transaction(() => {
            this.password.reset();
            this._error = null;
        });
    }

    reset() {
        this.Storage.remove(NewPasswordKey);
        transaction(() => {
            this.email.reset();
            this.password.reset();
            this._error = null;
            this._needsOldPassword = false;
        });
    }

    public async getHasAccount() {
        if (!await this.email.validate()) {
            return false;
        }

        const email = prepareEmail(this.email.value);

        if (DemoAccounts.includes(email)) {
            return 'devLogin';
        }

        const [authProviders, hasAcc] = await Promise.all([
            this.Auth.getEmailAuthMethod(email),
            this.Auth.getHasAccount(email),
        ]);

        logger.log('getHasAccount hasAcc =', hasAcc, ', authProviders =', authProviders);
        if (!hasAcc) {
            return 'noaccount';
        }

        return authProviders;
    }

    public forgotPasswordWeb = async () => {
        if (this._inProgress) {
            return false;
        }

        // WARNING this assumed to be called only when email address is validated already
        this._error = null;
        this._inProgress = true;
        try {
            await this.Auth.signInWithEmailLink(this.email.value, MagicLinkRequestReasons.PasswordReset);
            return true;
        } catch (err) {
            this._error = err.message;
            return false;
        } finally {
            this._inProgress = false;
        }
    }

    public forgotPassword = async () => {
        if (this._inProgress) {
            return false;
        }

        // WARNING this assumed to be called only when email address is validated already
        this._error = null;
        this._inProgress = true;
        try {
            if (process.appFeatures.USE_MAGIC_LINK) {
                await this.Auth.signInWithEmailLink(this.email.value, MagicLinkRequestReasons.PasswordReset);
                return true;
            }
            this._isResettingPassword = true;
            const data = await this.Auth.sendVerificationCodeByEmail(this.email.value);
            return data;
        } catch (err) {
            this._error = err.message;
        } finally {
            this._inProgress = false;
        }
        return false;
    }

    public signInWithPassword = async (): Promise<boolean> => {
        if (this._inProgress) {
            return false;
        }

        this._error = null;
        this._inProgress = true;
        this.isSettingNewPassword = false;
        try {
            if (await TextInputVM.IsSomeInvalid([this.email, this.password])) {
                return false;
            }

            await this.Auth.signInWithEmailPassword(this.email.value, this.password.value);

            return true;
        } catch (err) {
            logger.log('signInWithPassword ERROR', err.code, err.message);
            this._error = this.Localization.Current.FirebaseErrors[err.code] || err.message || 'Unknown error occured';
            return false;
        } finally {
            this._inProgress = false;
        }
    }

    public signInWithEmailOnly = async () => {
        if (!await this.email.validate()) {
            return 'invalidEmail';
        }
        
        const email = prepareEmail(this.email.value);

        const data = await this.Auth.signInWithEmailOnly(email);

        return data;
    } 

    public sendVerificationCodeByEmail = async (): Promise<{ result: boolean } | 'noInvitation' | 'usePassword' | 'invalidEmail'> => {
        if (!await this.email.validate()) {
            return 'invalidEmail';
        }

        const email = prepareEmail(this.email.value);

        const accountStatus = await this.getHasAccount();

        if (Array.isArray(accountStatus) && accountStatus.length > 0) {
            return 'usePassword';
        }

        return await this.Auth.sendVerificationCodeByEmail(email);
    }

    public signInWithMagicLink = async (force = false): Promise<boolean | 'usePassword' | 'noaccount' | 'devLogin'> => {
        if (this._inProgress) {
            return false;
        }

        if (!await this.email.validate()) {
            return false;
        }
        const email = prepareEmail(this.email.value);

        this._error = null;
        this._inProgress = true;

        try {
            const accountStatus = await this.getHasAccount();
            logger.log('Got account status for', email, ' ==> ', accountStatus);
            if (accountStatus === 'devLogin') {
                const ok = await this.devLogin();
                return ok ? 'devLogin' : false;
            }

            if (!accountStatus) {
                return false;
            }

            if (accountStatus === 'noaccount') {
                return 'noaccount';
            }

            if (!force && accountStatus.includes(AuthProviders.EmailAndPassword)) {
                return 'usePassword';
            }

            await this.Auth.signInWithEmailLink(this.email.value, MagicLinkRequestReasons.SignIn);

            return true;
        } catch (err) {
            logger.log('signInWithMagicLink ERROR', err);
            this._error = err.message;
            return false;
        } finally {
            this._inProgress = false;
        }
    }

    public resetPassword = async () => {
        const data = await this.Auth.resetPassword(this.email.value, this.password.value);

        if (data && data.result) {
            this._isResettingPassword = false;
        }

        return data;
    }

    public updatePassword = async (allowOldPassword = true) => {
        this._error = null;
        this._inProgress = true;

        if (!allowOldPassword) {
            this._needsOldPassword = false;
        }

        try {
            this.isSettingNewPassword = !this._needsOldPassword;

            const isValid = this._needsOldPassword || await this.password.validate();
            if (!isValid) {
                return false;
            }

            if (!this._needsOldPassword) {
                await this.Storage.setValue(NewPasswordKey, this.password.value);
            }

            const newPassword = this._needsOldPassword
                ? await this.Storage.getValue(NewPasswordKey)
                : this.password.value;
            const oldPassword = this._needsOldPassword
                ? this.password.value
                : null;

            const resp = await this.Auth.updatePasswordWithEmail(this.email.value, newPassword, oldPassword);

            if (resp.result === false) {
                if (resp.error === AuthErrors.NeedsReauthentication) {
                    if (this.Auth.needsCreatePassword === true) {
                        await this.Auth.signInWithEmailLink(this.Auth.authUser.email, MagicLinkRequestReasons.PasswordChange);
                        return 'magicLink';
                    }
                    this._needsOldPassword = true;
                    this.password.reset();
                    return 'oldPassword';
                }

                this._error = this.getErrorMessage(resp.original);
                return false;
            } else {
                this._needsOldPassword = false;
                await this.Storage.remove(NewPasswordKey);
                return true;
            }
        } catch (err) {
            this._error = this.getErrorMessage(err);
            return false;
        } finally {
            this._inProgress = false;
        }
    }

    public googleSignIn = async () => {
        this._error = null;
        this._inProgress = true;
        try {
            const res = await this.Auth.signInWithGoogle();
            return res;
        } catch (err) {
            logger.error('GOOGLE SIGN IN ERROR:', err);
            throw err;
        } finally {
            this._inProgress = false;
        }
    }

    public devLogin = async (): Promise<boolean> => {
        if (!await this.email.validate()) {
            return false;
        }

        logger.log('DEVELOPMENT LOGIN FOR', this.email.value, '...');

        this._error = null;
        this._inProgress = true;
        let result: boolean;

        try {
            await this.Auth.devLogin(this.email.value);
            result = true;
        } catch (err) {
            logger.error('Failed to make dev login. err: ', err);
            this._error = 'Something went worng. Please try again or contact administrator';
            result = false;
        } finally {
            this._inProgress = false;
            return result;
        }
    }

    private getErrorMessage(err: FirebaseError) {
        return this.Localization.Current.FirebaseErrors[err?.code] || err?.message || 'Unknown error occured';
    }
}
