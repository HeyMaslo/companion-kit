import { observable } from 'mobx';
import * as ViewModels from 'common/viewModels';
import * as Validations from 'common/utils/validation';
import Localization from '../services/localization';

const { TextInputVM } = ViewModels;

export default class TextRecordScreenViewModel {
    @observable
    private _isEditable: boolean;

    readonly textRecord = new TextInputVM({
        name: 'text record',
        validation: {
            validator: Validations.Validators.notEmpty,
            errors: Localization.ValidationErrors,
        },
    });

    get isEditable() {
        return this._isEditable;
    }

    set isEditable(val: boolean) {
        this._isEditable = val;
    }

    public reset = () => {
        this.textRecord.reset();
    };
}
