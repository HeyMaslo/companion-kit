import { DomainId, PartialQol } from './QoL';

export type DomainSelection = DomainId[];

export type UserState = {
    surveyState:    PartialQol;
    focusDomains:   DomainSelection;
};