import LocalizationManager, {
    ILocalization,
} from 'common/services/localization/LocalizationManager';
import StringsShape from './shape';
import { EnUs } from './langs/en-US';

const Locales = {
    default: EnUs,
    'en-US': EnUs,
};

type LocaleTypes = keyof typeof Locales;

const Localization = new LocalizationManager<LocaleTypes, StringsShape>(
    Locales,
    'default',
);

ILocalization.setDefault(Localization);

export default Localization;
