import Lazy from 'common/utils/lazy';
import * as Validations from 'common/utils/validation';
import { TextInputVM } from 'common/viewModels';
import { observable } from 'mobx';
import AppController from 'src/controllers';
import Localization from 'src/services/localization';
import StorageAsync from 'src/services/StorageAsync';

export class NoInvitationViewModel {

    @observable
    protected _error: string = null;

    @observable
    protected _inProgress = false;

    protected get Auth() { return AppController.Instance.Auth; }
    protected get Localization() { return Localization; }
    protected get Storage() { return StorageAsync; }
    get error() { return this._error; }
    get inProgress() { return this._inProgress; }

    get enableAppleButton() { return AppController.Instance.Auth.appleSignInSupported; }

    readonly email = new TextInputVM({
        name: 'email',
        trimOnValidate: true,
        validation: {
            validator: Validations.Validators.email,
            errors: () => this.Localization.ValidationErrors,
        },
    });


}
const instance = new Lazy(() => new NoInvitationViewModel());

export default {
    get Instance() { return instance.value; },
    prewarm() { instance.prewarm(); },
};
