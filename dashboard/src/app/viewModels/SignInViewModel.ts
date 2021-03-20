import { observable, autorun } from 'mobx';
import Localization from 'app/services/localization';
import AppController from 'app/controllers';
import { SignInViewModelBase, logger } from 'common/viewModels/SignInViewModel';
import { TextInputVM, ValidatableViewModel, SelectString } from 'common/viewModels';
import { StorageAsync } from 'app/services/Storage';
import History from 'app/services/history';
import * as Routes from 'app/constants/routes';
import NamesHelper from 'common/utils/nameHelper';
import * as Validations from 'common/utils/validation';
import { Unsubscriber } from 'common/utils/unsubscriber';
import AppQuery from 'app/services/AppQuery';
import { PushToast } from './ToasterViewModel';
import { Organizations, DefaultOrganizationIndex } from 'common/models/organizations';
import { Dashboard as DashboardFeatures } from 'common/constants/features';
import { createPhoneValidator } from 'app/utils/moduleWrappers';

export type TextLabelProps = string | { text: string, submit: () => any };

export type TextBlockProps = {
    title: string;
    label: TextLabelProps | TextLabelProps[];
};

type SignInStateData = {
    text: TextBlockProps,
    footer?: TextLabelProps | TextLabelProps[],
};

type ValueOrGetter<T> = T | (() => T);

export enum SignInStates {
    Email,
    Password,
    SignUp,
    CreatePassword,
    ResetPassword,
}

export default class SignInViewModel extends SignInViewModelBase {

    private readonly _stateData: Partial<Record<SignInStates, ValueOrGetter<SignInStateData>>> = {
        [SignInStates.Email]: {
            text: {
                title: 'Welcome',
                label: 'Enter your email to get started',
            },
        },
        [SignInStates.Password]: {
            text: {
                title: 'Welcome back',
                label: [
                    'Forgot your password?',
                    {
                        text: 'Reset',
                        submit: () => this.resetPasswordWeb(),
                    },
                ],
            },
            footer: [
                'You can also',
                {
                    text: 'use magic link',
                    submit: () => this.useMagicLink(),
                },
                'instead',
            ],
        },
        [SignInStates.SignUp]: () => ({
            text: {
                title: this.forceSignup ? 'Finish Sign Up' : 'Create account',
                label: this.forceSignup
                    ? [
                        `Not ${this.email.value}?`,
                        {
                            text: 'Sign Out',
                            submit: () => this.signOut(),
                        },
                    ] : [
                        'Already have an account?',
                        {
                            text: 'Login',
                            submit: () => {
                                this._state = SignInStates.Email;
                            },
                        },
                    ],
            },
        }),
        [SignInStates.CreatePassword]: {
            text: {
                title: 'Create password',
                label: 'We need it to secure your account',
            },
            footer: [
                'Want to do it later?',
                {
                    text: 'Skip',
                    submit: () => AppController.Instance.Auth.skipPasswordMode(),
                },
            ],
        },
        [SignInStates.ResetPassword]: {
            text: {
                title: 'Reset password',
                label: 'Create a new password for your account',
            },
            footer: [
                'Want to do it later?',
                {
                    text: 'Skip',
                    submit: () => AppController.Instance.Auth.skipPasswordMode(),
                },
            ],
        },
    };

    @observable
    private _state: SignInStates = SignInStates.Email;

    private _disposer = new Unsubscriber();

    readonly fullName = new TextInputVM({
        name: 'fullname',
        trimOnValidate: true,
        validation: {
            validator: Validations.Validators.notEmpty,
            errors: Localization.ValidationErrors,
        },
    });

    readonly organizationSelect = Organizations?.length ? new SelectString(
        Organizations,
        DefaultOrganizationIndex,
        {
            validator: Validations.Validators.notEmpty,
            errors: Localization.ValidationErrors,
        }) : null;

    private readonly _phoneValidator = createPhoneValidator(DashboardFeatures.UseMobileNumber?.countries);

    readonly mobilePhone = DashboardFeatures.UseMobileNumber ? new TextInputVM({
        name: 'phone number',
        value: '',
        validation: {
            validator: this._phoneValidator.validator,
            errors: Localization.ValidationErrors,
        },
        formatterHook: s => this._phoneValidator.setValue(s),
    }) : null;

    constructor() {
        super();

        this._disposer.add(autorun(this.tryFillFromAuthUser));
    }

    protected get Auth() { return AppController.Instance.Auth; }
    protected get Localization() { return Localization; }
    protected get Storage() { return StorageAsync; }

    get currentState() { return this._state; }

    get textBlockContent(): SignInStateData {
        const d = this._stateData[this._state];
        if (typeof d === 'function') {
            return d();
        }
        return d;
    }

    get forceSignup() { return AppController.Instance.User.accountMissing; }

    private tryFillFromAuthUser = () => {
        const { authUser, setPasswordMode, needsCreatePassword } = AppController.Instance.Auth;
        if (authUser && this.forceSignup) {
            this._state = SignInStates.SignUp;
            this._error = Localization.Current.SignUp.CompleteRequired;

            this.fullName.value = authUser.displayName;
            this.email.value = authUser.email;
            return;
        }

        if (setPasswordMode) {
            this._state = needsCreatePassword
                ? SignInStates.CreatePassword
                : SignInStates.ResetPassword;
            return;
        }

        this.reset();
    }

    reset() {
        super.reset();

        this.fullName.reset();
        this.email.value = AppQuery.Current.email || '';
    }

    submit = () => {
        switch (this._state) {
            case SignInStates.Email: {
                return this.submitEmail();
            }

            case SignInStates.Password: {
                return this.signInWithPassword();
            }

            case SignInStates.SignUp: {
                return this.signUp();
            }

            case SignInStates.ResetPassword:
            case SignInStates.CreatePassword: {
                return this.createPassword();
            }

            default: {
                throw new Error('Invalid state');
            }
        }

    }

    // States Actions
    private submitEmail = async () => {
        // try to send magic link
        const result = await this.signInWithMagicLink();
        if (!result || result === 'devLogin') {
            return;
        }

        if (result === 'noaccount') {
            this._state = SignInStates.SignUp;
            return;
        }

        if (result === 'usePassword') {
            // go to password enter state
            this._state = SignInStates.Password;
            return;
        }

        // show modal with magic link stuff
        History.push(Routes.CheckYourEmail);
    }

    private useMagicLink = async () => {
        const result = await this.signInWithMagicLink(true);
        if (!result) {
            return;
        }

        History.push(Routes.CheckYourEmail);
    }

    private resetPasswordWeb = async () => {
        const res = await this.forgotPasswordWeb();
        if (res) {
            History.push(Routes.CheckYourEmail_PasswordReset);
        }
    }

    private signOut = async () => {
        await AppController.Instance.Auth.signOut();
        this.reset();
        this._state = SignInStates.Email;
    }

    private signUp = async () => {
        if (this._inProgress) {
            return;
        }

        this.isSettingNewPassword = true;

        if (await ValidatableViewModel.IsSomeInvalid([this.email, this.fullName, this.password, this.organizationSelect, this.mobilePhone], false)) {
            return;
        }

        this._inProgress = true;
        logger.log('Signing Up', this.email.value, '...');

        try {
            if (!this.forceSignup) {
                const hasAccountResult = await this.getHasAccount();
                if (!hasAccountResult) { // validation errors
                    return;
                }

                if (hasAccountResult !== 'noaccount') {
                    this.password.reset();
                    this._error = Localization.Current.SignUp.HasAccount;
                    this._state = SignInStates.Email;
                    return;
                }
            }

            const split = NamesHelper.split({ displayName: this.fullName.value });

            const result = await AppController.Instance.Auth.signUp({
                email: this.email.value,
                displayName: this.fullName.value,
                firstName: split.firstName,
                lastName: split.lastName,
                password: this.password.value,
                organization: this.organizationSelect?.selectedValue || null,
                phoneNumber: this.mobilePhone?.value || null,
            });

            logger.log('SIGNED UP name: ', this.fullName.value, 'email: ', this.email.value);

            if (result === 'magicLink') {
                History.replace(Routes.CheckYourEmail);
            }
        } catch (err) {
            logger.warn('[ERROR]: ', err);
            this._error = Localization.Current.UnknownServerError;
        } finally {
            this._inProgress = false;
        }
    }

    private createPassword = async () => {
        this._inProgress = true;
        this._error = null;

        try {
            const result = await this.updatePassword(false);
            logger.log('createPassword result = ', result);
            if (!result) {
                return;
            }

            if (result === 'magicLink') {
                History.push(Routes.CheckYourEmail_PasswordReset);
                return;
            }

            if (result === true) {
                PushToast({ text: 'Your password has been changed successfully' });
                History.push(Routes.Home);
                return;
            }

            if (result !== 'oldPassword') {
                AppController.Instance.Auth.skipPasswordMode();
            }

            this._error = 'Failed to update your password. Please try again.';
        } finally {
            this._inProgress = false;
        }
    }

    dispose = () => {
        this._disposer.dispose();
    }
}
