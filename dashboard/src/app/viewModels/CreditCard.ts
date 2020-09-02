import { TextInputVM, ValidatableViewModel } from 'common/viewModels';
import * as Validations from 'common/utils/validation';
import Localization from 'app/services/localization';

export default class CreditCardViewModel {
    readonly cardNumber = new TextInputVM({
        name: 'cardNumber',
        validation: {
            validator: Validations.CreditCard.creditCardNumber,
            errors: Localization.ValidationErrors,
        },
    });

    readonly expiryDate = new TextInputVM({
        name: 'expiryDate',
        validation: {
            validator: Validations.CreditCard.creditCardExpiryDate,
            errors: Localization.ValidationErrors,
        },
    });

    readonly cvv = new TextInputVM({
        name: 'cvv',
        validation: {
            validator: Validations.CreditCard.creditCardCvv,
            errors: Localization.ValidationErrors,
        },
    });

    private readonly _allFields: ValidatableViewModel[] = [
        this.cardNumber, this.expiryDate, this.cvv,
    ];

    get maskedCardNumber() {
        if (!this.cardNumber.value) {
            return '';
        }

        return `**** **** **** *${this.cardNumber.value.slice(-3)}`;
    }

    public validate = () => ValidatableViewModel.IsSomeInvalid(this._allFields, false);
}