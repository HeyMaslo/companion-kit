import { observable } from 'mobx';
import * as Validations from 'common/utils/validation';
import { PhoneValidator } from 'common/utils/validation/phoneNumber';
import Localization from '../services/localization';
import {
    TextInputVM,
    ValidatableViewModel,
    IValidatable,
} from 'common/viewModels';
import AppController from 'src/controllers';
import { createLogger } from 'common/logger';

const logger = createLogger('[ConfirmPersonScreen]');

export enum FieldTypes {
    FullName,
    Zipcode,
    PhoneNumber,
}

const AllFields = [
    FieldTypes.FullName,
    FieldTypes.Zipcode,
    FieldTypes.PhoneNumber,
];

export default class ConfirmAccountViewModel {
    @observable
    private _inProgress = false;

    readonly name = new TextInputVM({
        name: 'your name',
        value: this.fullName,
        validation: {
            validator: Validations.Validators.notEmpty,
            errors: Localization.ValidationErrors,
        },
    });

    readonly zipcode = false
        ? new TextInputVM({
              name: 'zip code',
              value: '',
              validation: {
                  validator: Validations.Validators.zipcode,
                  errors: Localization.ValidationErrors,
              },
          })
        : null;

    private readonly _phoneValidator = false ? new PhoneValidator() : null;

    readonly phoneNumber = false
        ? new TextInputVM({
              name: 'phone number',
              value: '',
              validation: {
                  validator: this._phoneValidator.validator,
                  errors: Localization.ValidationErrors,
              },
              formatterHook: (s) => this._phoneValidator.setValue(s),
          })
        : null;

    get inProgress() {
        return this._inProgress;
    }

    get user() {
        return AppController.Instance.User.user;
    }

    get fullName() {
        const user = AppController.Instance.User.user;
        return (
            user && (user.displayName || `${user.firstName} ${user.lastName}`)
        );
    }

    getModelByType(type: FieldTypes) {
        switch (type) {
            case FieldTypes.FullName: {
                return this.name;
            }

            case FieldTypes.Zipcode: {
                return this.zipcode;
            }

            case FieldTypes.PhoneNumber: {
                return this.phoneNumber;
            }

            default: {
                return null;
            }
        }
    }

    private async doSafe(cb: () => Promise<boolean>, debugName = 'hz') {
        if (this._inProgress) {
            return;
        }

        this._inProgress = true;
        try {
            const res = await cb();
            return res;
        } catch (err) {
            logger.warn(
                'An error occurder during execution of',
                debugName,
                err,
            );
        } finally {
            this._inProgress = false;
        }
    }

    public decline = () => {
        return AppController.Instance.Auth.signOut();
    };

    public submit = (fieldsToSubmit: FieldTypes[] = AllFields) =>
        this.doSafe(async () => {
            const validatables: IValidatable[] = fieldsToSubmit.map((ft) =>
                this.getModelByType(ft),
            );
            if (await ValidatableViewModel.IsSomeInvalid(validatables)) {
                return false;
            }

            const needs = (ft: FieldTypes, vm: TextInputVM) =>
                vm && fieldsToSubmit.includes(ft) ? vm.value : undefined;

            await AppController.Instance.User.finishOnBoarding({
                displayName: needs(FieldTypes.FullName, this.name),
                zipcode: needs(FieldTypes.Zipcode, this.zipcode),
                phone: needs(FieldTypes.PhoneNumber, this.phoneNumber),
            });
            return true;
        }, 'submit');
}
