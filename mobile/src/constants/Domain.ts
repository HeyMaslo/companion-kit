import { Identify } from 'common/models';

export enum DomainScope {
  GENERAL = 'GENERAL',
  WORK = 'WORK',
  STUDENT = 'STUDENT',
}

export type Domain = {
  scope:      DomainScope,
  name:       string,
  slug:       string,
  importance: string,     // description of why the domain is important
};

export type DomainIded = Identify<Domain>;