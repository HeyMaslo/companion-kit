import { DomainName, SubdomainName } from './Domain';

export type Strategy = {
  internalId:               string, // this will be the same as the strategy's document id in firestore
  title:                    string,
  details:                  string,
  associatedDomainNames:    string[],
};

export type DisplayStrategy = Strategy & {
  isChecked: boolean,
};