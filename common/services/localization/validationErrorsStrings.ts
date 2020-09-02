import { ValidationErrors } from 'common/utils/validation';
import type { StringsShape } from './defaultShape';

export type ValidationErrorsStrings = {[ error: number]: string };

export default function Create(strings: StringsShape): ValidationErrorsStrings {
    return {
        [ValidationErrors.None]: '',
        [ValidationErrors.ShouldBeNonEmpty]: strings.Validation.Empty,
        [ValidationErrors.InvalidNameFormat]: strings.Validation.Name,
        [ValidationErrors.InvalidEmailFormat]: strings.Validation.Email,
        [ValidationErrors.InvalidPasswordFormat]: strings.Validation.Password,
        [ValidationErrors.OnlyEnglishLetters]: strings.Validation.EnglishOnly,
        [ValidationErrors.InvalidURLFormat]: strings.Validation.URL,
        [ValidationErrors.InvalidPhoneFormat]: strings.Validation.Phone,
        [ValidationErrors.InvalidPhoneCountry]: strings.Validation.PhoneCountry,
        [ValidationErrors.InvalidCreditCardFormat]: strings.Validation.CreditCard,
        [ValidationErrors.InvalidCreditCardExpiryDateFormat]: strings.Validation.CreditCardExpiryDate,
        [ValidationErrors.InvalidCreditCardCvvFormat]: strings.Validation.CreditCardCvv,
        [ValidationErrors.InvalidDate]: strings.Validation.InvalidDate,
        [ValidationErrors.NotFutureDate]: strings.Validation.NotFutureDate,
        [ValidationErrors.FutureDate]: strings.Validation.FutureDate,
        [ValidationErrors.TextLength]: strings.Validation.TextLength,
        [ValidationErrors.InvalidInteger]: strings.Validation.InvalidInteger,
        [ValidationErrors.MaxValue]: strings.Validation.MaxValue,
        [ValidationErrors.Zipcode]: strings.Validation.Zipcode,

        [ValidationErrors.FirstName]: strings.Validation.FirstName,
        [ValidationErrors.LastName]: strings.Validation.LastName,
        [ValidationErrors.Occupation]: strings.Validation.Occupation,
        [ValidationErrors.Relationship]: strings.Validation.Relationship,
        [ValidationErrors.Birthday]: strings.Validation.Birthday,
        [ValidationErrors.Goal]: strings.Validation.Goal,

    };
}
