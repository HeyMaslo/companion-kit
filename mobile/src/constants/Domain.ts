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
  position:   number,
  name:       DomainName,
  slug:       string,
  importance: string,     // description of why the domain is important
};

export type DomainIded = Identify<Domain>;
