import type { CountryCode, PhoneValidator as PhoneValidatorType } from 'common/utils/validation/phoneNumber';
import { PhoneValidator } from 'common/utils/validation/phoneNumber';

export function createPhoneValidator(countries: CountryCode[]): PhoneValidatorType {
    if (countries != null) {
        return new PhoneValidator(countries);
    }
    return null;
}
