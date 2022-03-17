import { DomainName, DomainSlug, SubdomainName } from "./Domain";

export type BackendStrategy = {
  title:                    string,
  slug:                     string, // this will be the same as the strategy's document id in firestore
  domains:                  DomainSlug[],
  illustrationFilename:     string,
  color:                    string, // e.g. #2A327A
  shortDescription:         string,
  whatToKnowBullets:        string[],
  details:                  string, // HTML String
  friendlyTitle:            string,
};

export type Strategy = {
  title:                    string,
  slug:                     string, // this will be the same as the strategy's document id in firestore
  domains:                  (DomainName | SubdomainName)[],
  illustrationFilename:     string,
  color:                    string, // e.g. #2A327A
  shortDescription:         string,
  whatToKnowBullets:        string[],
  details:                  string, // HTML String
  friendlyTitle:            string,
};

export type DisplayStrategy = Strategy & {
  isChecked: boolean,
};