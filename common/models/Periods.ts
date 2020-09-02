import EnumHelper from 'common/utils/enumHelper';
import { ILocalization } from 'common/services/localization/ILocalization';

const day = 3600 * 24; // seconds

export enum Periods {
    ThisWeek = 7 * day,
    Month = 30 * day,
    Months3 = 90 * day,
    Months6 = 180 * day,
}

export namespace Periods {
    export const Helper = new EnumHelper<Periods>(Periods);

    export const Strings =  {
        get [Periods.ThisWeek]() { return ILocalization.getDefault().Periods.ThisWeek; },
        get [Periods.Month]() { return ILocalization.getDefault().Periods.Month; },
        get [Periods.Months3]() { return ILocalization.getDefault().Periods.Months3; },
        get [Periods.Months6]() { return ILocalization.getDefault().Periods.Months6; },
    };
}
