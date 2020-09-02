import { EnumStringHelper } from 'common/utils/enumHelper';

enum Categories {
    ALL = 'ALL',
    OTHER = 'OTHER',
    PERSON = 'PERSON',
    LOCATION = 'LOCATION',
}

namespace Categories {
    export const Helper = new EnumStringHelper<Categories>(Categories);

    export const AllCategories = Helper.Keys;
}

export const CATEGORIES: { [value: string]: Array<string> } = {
    [Categories.OTHER]: ['OTHER', 'WORK_OF_ART', 'EVENT', 'NUMBER', 'ORGANIZATION'],
    [Categories.PERSON]: ['PERSON'],
    [Categories.LOCATION]: ['LOCATION', 'EVENT'],
};

export default Categories;