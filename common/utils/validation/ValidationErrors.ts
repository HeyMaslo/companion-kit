import EnumHelper from 'common/utils/enumHelper';

export enum ValidationErrors {
    None = 0,
    ShouldBeNonEmpty,
    ShouldBeEqualTo,
    InvalidNameFormat,
    InvalidEmailFormat,
    InvalidPasswordFormat,
    OnlyEnglishLetters,
    InvalidURLFormat,
    InvalidPhoneFormat,
    InvalidPhoneCountry,
    InvalidCreditCardFormat,
    InvalidCreditCardExpiryDateFormat,
    InvalidCreditCardCvvFormat,
    InvalidDate,
    NotFutureDate,
    FutureDate,
    TextLength,
    InvalidInteger,
    MaxValue,
    Zipcode,

    EmailIsInUse,
    FirstName,
    LastName,
    Occupation,
    Relationship,
    Birthday,
    Goal,

    ValueOutOfRange,
}

export namespace ValidationErrors {
    export const Helper = new EnumHelper<ValidationErrors>(ValidationErrors);
}
