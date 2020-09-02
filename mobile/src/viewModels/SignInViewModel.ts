import Localization from 'src/services/localization';
import Lazy from 'common/utils/lazy';
import AppController from 'src/controllers';
import { SignInViewModelBase, logger } from 'common/viewModels/SignInViewModel';
import StorageAsync from 'src/services/StorageAsync';
import { ValidatableViewModel } from 'common/viewModels';
import { prepareEmail } from 'common/utils/emails';

export class SignInViewModel extends SignInViewModelBase {

    protected get Auth() { return AppController.Instance.Auth; }
    protected get Localization() { return Localization; }
    protected get Storage() { return StorageAsync; }

    get enableAppleButton() { return AppController.Instance.Auth.appleSignInSupported; }

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
}

const instance = new Lazy(() => new SignInViewModel());

export default {
    get Instance() { return instance.value; },
    prewarm() { instance.prewarm(); },
};
