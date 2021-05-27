import { PartialQol } from './QoL';


export type UserState = {
    surveyState:    PartialQol;
    focusDomains?:   string[];
    chosenStrategies?: string[];
};