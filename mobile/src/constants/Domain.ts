
export enum DomainSlug {
  MOOD            = 'Mood',
  PHYSICAL        = 'Physical',
  SLEEP           = 'Sleep',
  THINKING        = 'Thinking',
  IDENTITY        = 'Identity',
  LEISURE         = 'Leisure',
  INDEPENDENCE    = 'Independence',
  SELFESTEEM      = 'SelfEsteem',
  HOME            = 'Home',
  MONEY           = 'Money',
  SPIRITUALITY    = 'Spirituality',
  RELATIONSHIPS   = 'Relationships',
  WORK            = 'Work',
  STUDY           = 'Study',
  // Physical subdomains
  EXERCISE        = 'Exercise',
  DIETNUTRITION   = 'DietNutrition',
  SEXUALHEALTH    = 'SexualHealth',
  SUBSTANCEUSE    = 'SubstanceUse',
}

// DomainName displayed in the UI
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

// SubdomainName displayed in the UI
export enum SubdomainName {
  // Physical
  EXERCISE        = 'Exercise',
  DIETNUTRITION   = 'Diet & Nutrition',
  SEXUALHEALTH    = 'Sexual Health',
  SUBSTANCEUSE    = 'Substance Use',
}

export type Domain = {
  name:              DomainName,
  slug:              DomainSlug,
  importance:        string,     // description of why the domain is important
  importanceBullets: string[],   // the key points of domain importance
  whatToKnowBullets: string[],
  subdomains?:       Subdomain[],
};

export type Subdomain = {
  name:       SubdomainName,
  slug:       DomainSlug,
  importance: string,
  bullets:    string[],
};

export type FocusedDomains = {
  domains: DomainSlug[],
  subdomains: DomainSlug[],
};
