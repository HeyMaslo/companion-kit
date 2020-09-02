import logger from 'common/logger';
import { TextInputVM, ValidatableViewModel } from 'common/viewModels';
import * as Validations from 'common/utils/validation';
import { Caretaker } from 'common/models/ClientCard';
import Localization from 'app/services/localization';

export default class ClientCaretakerViewModel {
    firstName = new TextInputVM({
        name: 'caretakerFirstName',
        trimOnValidate: true,
        validation: this._required && {
            validator: Validations.Validators.firstName,
            errors: Localization.ValidationErrors,
        },
    });

    lastName = new TextInputVM({
        name: 'caretakerLastName',
        trimOnValidate: true,
        validation: this._required && {
            validator: Validations.Validators.lastName,
            errors: Localization.ValidationErrors,
        },
    });

    email = new TextInputVM({
        name: 'caretakerEmail',
        trimOnValidate: true,
        validation: this._required && {
            validator: Validations.Validators.email,
            errors: Localization.ValidationErrors,
        },
    });

    relationship = new TextInputVM({
        name: 'caretakerRelationship',
        trimOnValidate: true,
        validation: this._required && {
            validator: Validations.Validators.relationship,
            errors: Localization.ValidationErrors,
        },
    });

    phone = new TextInputVM({
        trimOnValidate: true,
        name: 'caretakerPhone',
        validation: this._required && {
            validator: Validations.Validators.notEmpty,
            errors: Localization.ValidationErrors,
        },
    });

    constructor(private readonly _required: boolean = true) {}

    private readonly _allFields: TextInputVM[] = [
        this.firstName, this.lastName, this.email, this.relationship, this.phone,
    ];

    get isAllEmpty() {
        return this._allFields.every(field => {
            return !field.value;
        });
    }

    fillCaretaker(data: Caretaker) {
        if (data) {
            this.firstName.value = data.firstName;
            this.lastName.value = data.lastName;
            this.email.value = data.email;
            this.relationship.value = data.relationship;
            this.phone.value = data.phone;
        }
    }

    resetAllFields() {
        this._allFields.forEach(field => {
            field.reset();
        });
    }

    validate = async () => {
        const invalid = await ValidatableViewModel.IsSomeInvalid(this._allFields, false);
        return !invalid;
    }

    getData() {
        if (this.isAllEmpty) {
            return null;
        }

        return {
            email: this.email.value,
            firstName: this.firstName.value,
            lastName: this.lastName.value,
            relationship: this.relationship.value,
            phone: this.phone.value,
        };
    }
}
