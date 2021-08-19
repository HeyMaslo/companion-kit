import { PartialQol } from '../../mobile/src/constants/QoL';

export type LastSeen = {
    [key: string]: number,
};

export type UserState = {
    surveyState:    PartialQol;
    focusDomains?:   string[];
    chosenStrategies?: string[];
    lastSeenAffirmations?: LastSeen,
};
