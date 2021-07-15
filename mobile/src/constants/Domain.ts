import { Identify } from 'common/models';

export enum DomainScope {
  GENERAL = 'GENERAL',
  WORK = 'WORK',
  STUDENT = 'STUDENT',
}

export enum DomainName {
  MOOD            = 'Mood',
  PHYSICAL        = 'Physical',
  SLEEP           = 'Sleep',
  THINKING        = 'Thinking',
  IDENTITY        = 'Identity',
  LEISURE         = 'Leisure',
  INDEPENDENCE    = 'Independence',
  SELFESTEEM      = 'Self-esteem',
  HOME            = 'Home',
  MONEY           = 'Money',
  SPIRITUAL       = 'Spiritual',
  RELATIONSHIPS   = 'Relationships',
}

export type Domain = {
  scope:      DomainScope,
  name:       DomainName,
  slug:       string,
  importance: string,     // description of why the domain is important
  bullets:    string[],   // the key points of domain importance
};

export type DomainIded = Identify<Domain>;
