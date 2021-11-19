import { DomainName } from '../../mobile/src/constants/Domain';
import { PartialQol } from '../../mobile/src/constants/QoL';

export type UserState = {
    surveyState:    PartialQol;
    focusedDomains?:   DomainName[];
    chosenStrategies?: string[]; // array of Strategy.internalId (firestore document id) to reference strategies in the strategies collection
};