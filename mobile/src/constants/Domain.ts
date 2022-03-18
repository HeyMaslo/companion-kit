
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

export function domainNameForSlug(slug: DomainSlug): (DomainName | SubdomainName) {
  switch (slug) {
    case DomainSlug.MOOD:
      return DomainName.MOOD;
    case DomainSlug.PHYSICAL:
      return DomainName.PHYSICAL;
    case DomainSlug.SLEEP:
      return DomainName.SLEEP;
    case DomainSlug.THINKING:
      return DomainName.THINKING;
    case DomainSlug.IDENTITY:
      return DomainName.IDENTITY;
    case DomainSlug.LEISURE:
      return DomainName.LEISURE;
    case DomainSlug.INDEPENDENCE:
      return DomainName.INDEPENDENCE;
    case DomainSlug.SELFESTEEM:
      return DomainName.SELFESTEEM;
    case DomainSlug.HOME:
      return DomainName.HOME;
    case DomainSlug.MONEY:
      return DomainName.MONEY;
    case DomainSlug.SPIRITUALITY:
      return DomainName.SPIRITUALITY;
    case DomainSlug.RELATIONSHIPS:
      return DomainName.RELATIONSHIPS;
    case DomainSlug.WORK:
      return DomainName.WORK;
    case DomainSlug.STUDY:
      return DomainName.STUDY;
    case DomainSlug.EXERCISE:
      return SubdomainName.EXERCISE;
    case DomainSlug.DIETNUTRITION:
      return SubdomainName.DIETNUTRITION;
    case DomainSlug.SEXUALHEALTH:
      return SubdomainName.SEXUALHEALTH;
    case DomainSlug.SUBSTANCEUSE:
      return SubdomainName.SUBSTANCEUSE;
  }
}