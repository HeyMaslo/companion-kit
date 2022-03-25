
export type Resource = {
  title:          string,
  strategySlug:   string,
  type:           ResourceType,
  warningText:    string,
  summary:        string,
  link:           string,
  androidLink:    string,
  iosLink:        string,
};

export enum ResourceType {
  ARTICLE = 'Article',
  VIDEO = 'Video',
  WEBINAR = 'Webinar',
  APP = 'App',
  BLOG = 'Blog',
  OTHER = 'Other',
  WORKSHEET = 'Worksheet',
  YOUTUBECHANNEL = 'Youtube Channel'
}
