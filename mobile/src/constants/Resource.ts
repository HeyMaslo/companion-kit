
export type Resource = {
  slug: string, // used to identify each resource
  title: string,
  strategySlug: string,
  type: ResourceType,
  warningText: string, // will be empty string is there is no warning
  summary: string,
  link: string,
  androidLink: string, // will be empty string is there is no androidLink
  iosLink: string, // will be empty string is there is no iosLink
};

export enum ResourceType {
  ARTICLE = 'Article',
  VIDEO = 'Video',
  WEBINAR = 'Webinar',
  APP = 'App',
  BLOG = 'Blog',
  OTHER = 'Other',
  WORKSHEET = 'Worksheet',
  YOUTUBECHANNEL = 'Youtube Channel',
}
