import { ValidationErrors } from './ValidationErrors';

const RE = {
    creditCardNumber: /^\d+$/,
    expiryDateCard: /^\d+$/,
    cvv: /^\d+$/,

    amexType: /^\D*3[47]/,
};

const types: { [digit: number]: string } = {
    0: 'credit-card-alt',
    3: 'cc-amex',
    4: 'cc-visa',
    5: 'cc-mastercard',
    6: 'cc-discover',
};

function getDigitsCount(val: string): number {
    return RE.amexType.test(val) ? 15 : 16; // 15 digits if Amex
}

function getType(cardNumber: string) {
    const val = cardNumber + '';
    const firstDigit = +(val && val[0]) || 0;
    return types[firstDigit] || types[0];
}

export const CreditCardValidations = {
    creditCardNumber: (val: string) => {
        const shortVal = val.replace(/ /gi, '');
        const valid = RE.creditCardNumber.test(shortVal) && shortVal.length === getDigitsCount(shortVal);
        return valid ? ValidationErrors.None : ValidationErrors.InvalidCreditCardFormat;
    },
    creditCardExpiryDate: (val: string) => {
        const shortVal = val.replace(/\//gi, '');
        const valid = (RE.expiryDateCard.test(shortVal) && shortVal.length === 4);
        return valid ? ValidationErrors.None : ValidationErrors.InvalidCreditCardExpiryDateFormat;
    },
    creditCardCvv: (val: string) =>
        (RE.cvv.test(val) && val.length >= 3 && val.length <= 4) ? ValidationErrors.None : ValidationErrors.InvalidCreditCardCvvFormat,
};

export default {
    DEFAULT: types[0],
    getDigitsCount,
    getType,
};
