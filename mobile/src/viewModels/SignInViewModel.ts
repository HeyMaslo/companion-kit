import Localization from 'src/services/localization';
import Lazy from 'common/utils/lazy';
import AppController from 'src/controllers';
import { SignInViewModelBase, logger } from 'common/viewModels/SignInViewModel';
import StorageAsync from 'src/services/StorageAsync';
import { ValidatableViewModel } from 'common/viewModels';
import { prepareEmail } from 'common/utils/emails';
import { observable } from 'mobx';

export class SignInViewModel extends SignInViewModelBase {

    @observable
    protected _verificationCodeValue: string[] = new Array(6).fill(null);

    @observable
    protected _errorMsg: string;

    @observable
    protected _inputRefArray: any[] = new Array(6).fill(null);

    @observable
    protected _isPasting: boolean = false;

    protected get Auth() { return AppController.Instance.Auth; }
    protected get Localization() { return Localization; }
    protected get Storage() { return StorageAsync; }

    get enableAppleButton() { return AppController.Instance.Auth.appleSignInSupported; }

    get verificationCodeValue() { return this._verificationCodeValue; }
    set verificationCodeValue(verificationCodeValue: string[]) { this._verificationCodeValue = verificationCodeValue; }
    get errorMsg() { return this._errorMsg; }
    set errorMsg(errorMsg: string) { this._errorMsg = errorMsg; }
    get inputRefArray() { return this._inputRefArray; }
    set inputRefArray(inputRefArray: any[]) { this._inputRefArray = inputRefArray }
    get isPasting() { return this._isPasting; }
    set isPasting(isPasting: boolean) { this._isPasting = isPasting }

    public appleSignIn = async () => {
        try {
            this._inProgress = true;
            await AppController.Instance.Auth.signInWithApple();
        } catch (e) {
            logger.error(e);
        } finally {
            this._inProgress = false;
        }
    }

    init = () => {
        this._verificationCodeValue = new Array(6).fill(null);
    }

    public register = async () => {
        this._error = null;
        this._inProgress = true;

        try {
            if (await ValidatableViewModel.IsSomeInvalid([this.email, this.password])) {
                return false;
            }

            const e = prepareEmail(this.email.value);

            await AppController.Instance.Auth.createAccountForEmailAndPassword(e, this.password.value);

            return true;
        } catch (e) {
            logger.error(e);
            this._error = e.message;

            return false;
        } finally {
            this._inProgress = false;
        }
    }

    validateCode = async (): Promise<{ result: boolean, hasAccount: boolean }> => {
        const hasAcc = await AppController.Instance.Auth.hasAccount(this.email.value);

        const validCode = await AppController.Instance.Auth.validateCode(this.email.value, this.verificationCodeValue.join(''));

        return { result: validCode.result, hasAccount: !!hasAcc };
    }

    public cleanUpVerificationCodeForm = () => {
        this._verificationCodeValue = new Array(6).fill(null);
        this._errorMsg = null;
        this._error = null;
        this._inputRefArray = new Array(5).fill(null);
    }

    public createUser = async (): Promise<{ result: boolean }> => {
        this._inProgress = true;
        const data = await AppController.Instance.Auth.createAccountForEmailAfterVerificationCode(this.email.value);
        if (data || data.result) {
            this.cleanUpVerificationCodeForm();
        }
        return data;
    }
}

const instance = new Lazy(() => new SignInViewModel());

export default {
    get Instance() { return instance.value; },
    prewarm() { instance.prewarm(); },
};
