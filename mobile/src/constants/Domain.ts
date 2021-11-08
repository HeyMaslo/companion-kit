import { Identify } from 'common/models';

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

export enum SubdomainName {
  // Physical
  EXERCISE        = 'Exercise',
  DIETNUTRITION   = 'Diet & Nutrition',
  SEXUALHEALTH    = 'Sexual Health',
  SUBSTANCEUSE    = 'Substance Use',
}

export type Domain = {
  name:       DomainName,
  importance: string,     // description of why the domain is important
  bullets:    string[],   // the key points of domain importance
  subdomains?: Subdomain[],
};

export type Subdomain = {
  name:       SubdomainName,
  importance: string,
  bullets:    string[],
};

export type DomainIded = Identify<Domain>;
