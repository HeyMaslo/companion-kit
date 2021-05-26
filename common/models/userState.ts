import { DomainId } from "./QoL";

export type DomainSelection = DomainId[]; 

export type UserState = {
    focusDomains: DomainSelection;
}