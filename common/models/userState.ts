import { PartialQol } from '../../mobile/src/constants/QoL';

export type UserState = {
    surveyState:    PartialQol;
    focusDomains?:   string[];
    chosenStrategies?: string[];
};