// Slug used in backend only
export enum DomainSlug {
  MOOD            = 'Mood',
  PHYSICAL        = 'Physical',
  SLEEP           = 'Sleep',
  THINKING        = 'Thinking',
  IDENTITY        = 'Identity',
  LEISURE         = 'Leisure',
  INDEPENDENCE    = 'Independence',
  SELFESTEEM      = 'Self-Esteem',
  HOME            = 'Home',
  MONEY           = 'Money',
  SPIRITUALITY    = 'Spirituality',
  RELATIONSHIPS   = 'Relationships',
  WORK            = 'Work',
  STUDY           = 'Study',
  EXERCISE        = 'Exercise',
  DIETNUTRITION   = 'Diet & Nutrition',
  SEXUALHEALTH    = 'Sexual Health',
  SUBSTANCEUSE    = 'Substance Use',
}

// DomainName used in the frontent 
export enum DomainName {
  MOOD            = 'Mood',
  PHYSICAL        = 'Physical',
  SLEEP           = 'Sleep',
  THINKING        = 'Thinking',
  IDENTITY        = 'Identity',
  LEISURE         = 'Leisure',
  INDEPENDENCE    = 'Independence',
  SELFESTEEM      = 'Self-Esteem',
  HOME            = 'Home',
  MONEY           = 'Money',
  SPIRITUALITY    = 'Spirituality',
  RELATIONSHIPS   = 'Relationships',
  WORK            = 'Work',
  STUDY           = 'Study',
}

// SubdomainName used in the frontent 
export enum SubdomainName {
  // Physical
  EXERCISE        = 'Exercise',
  DIETNUTRITION   = 'Diet & Nutrition',
  SEXUALHEALTH    = 'Sexual Health',
  SUBSTANCEUSE    = 'Substance Use',
}

export type Domain = {
  name:              DomainName,
  importance:        string,     // description of why the domain is important
  importanceBullets: string[],   // the key points of domain importance
  whatToKnowBullets: string[],
  subdomains?:       Subdomain[],
};

export type Subdomain = {
  name:       SubdomainName,
  importance: string,
  bullets:    string[],
};

export type FocusedDomains = {
  domains: DomainName[],
  subdomains: SubdomainName[],
};
