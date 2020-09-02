import { EnumStringHelper } from 'common/utils/enumHelper';

enum Charts {
    mood = 'Self reported mood',
    phq9 = 'PHQ-9',
    ptsd = 'PTSD-RI',
    // rcads = 'RCADS-25',
    gad = 'GAD-7',
}

namespace Charts {
    export const Helper = new EnumStringHelper<Charts>(Charts);

    export const AllCharts = Helper.Values;
}
export default Charts;
