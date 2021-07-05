import * as ViewModels from 'common/viewModels';
import * as Validations from 'common/utils/validation';
import Localization from '../services/localization';
import { observable } from 'mobx';

const { TextInputVM } = ViewModels;

export default class SettingsEmailViewModel {
    @observable
    private _error: string = null;

    readonly email = new TextInputVM({
        name: 'email',
        validation: {
            validator: Validations.Validators.email,
            errors: Localization.ValidationErrors,
        },
    });

    get error() {
        return this._error;
    }

    public submit = async (): Promise<boolean> => {
        return false;
    };
}
