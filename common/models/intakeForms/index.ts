import { EnumStringHelper } from 'common/utils/enumHelper';
import Identify from 'common/models/Identify';
import * as Types from './types';

import { PHQ9 } from './phq9';
import { PTSD } from './ptsd';
import { RCADS } from './rcads';
import { GAD } from './gad';
import { Isolated } from './isolated';
import { Homeless } from './homeless';

export {
    Types as IntakeFormTypes,
};

export enum AssessmentType {
    phq9 = 'PHQ9',
    ptsd = 'PTSD',
    rcads = 'RCADS',
    gad = 'GAD',
    isolated = 'Isolated',
    homeless = 'Homeless',
}

export namespace AssessmentType {
    export const Helper = new EnumStringHelper<AssessmentType>(AssessmentType);

    export const EnabledTypes: { readonly value: AssessmentType[] } = {
        value: [
            AssessmentType.phq9,
            AssessmentType.ptsd,
            AssessmentType.gad,
            // AssessmentType.isolated,
            // AssessmentType.homeless,
        ],
    };

    export const getFullString: {[K in AssessmentType]: string} = {
        [AssessmentType.phq9]: 'PHQ-9',
        [AssessmentType.ptsd]: 'PTSD-RI',
        [AssessmentType.rcads]: 'RCADS-25',
        [AssessmentType.gad]: 'GAD-7',
        [AssessmentType.isolated]: 'Isolated Checklist',
        [AssessmentType.homeless]: 'Homeless Checklist',
    };

    export const getValueFromString: {[value: string]: AssessmentType} = {
        'PHQ-9': AssessmentType.phq9,
        'PTSD-RI': AssessmentType.ptsd,
        'RCADS-25': AssessmentType.rcads,
        'GAD-7': AssessmentType.gad,
        'Isolated Checklist': AssessmentType.isolated,
        'Homeless Checklist': AssessmentType.homeless,
    };
}

export interface AssessmentData {
    date: number;
    formType: AssessmentType,
    answers: number[],

    // for better locating it
    clientUid: string;
    coachUid: string;
    clientCardId: string;

    entryId: string;
}

export type AssessmentDataIded = Identify<AssessmentData>;

export const IntakeForms: Readonly<Record<AssessmentType, Readonly<Types.AssessmentTypeData>>> = {
    [AssessmentType.phq9]: PHQ9,
    [AssessmentType.ptsd]: PTSD,
    [AssessmentType.rcads]: RCADS,
    [AssessmentType.gad]: GAD,
    [AssessmentType.isolated]: Isolated,
    [AssessmentType.homeless]: Homeless,
};

export {
    PHQ9,
    PTSD,
    RCADS,
    GAD,
    Isolated,
    Homeless,
};
