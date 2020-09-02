import { AssessmentType } from 'common/models';
import { Environments, FeaturesSettingsType, EmailSettingsType, LinksSettingsType, ClientsSettingsType } from './types';

import * as app from './app';

let configEnvs = process.env.APP_ENV;

export const IS_PROD = configEnvs === 'production';

if (!IS_PROD) {
    const ownProperties = Object.getOwnPropertyNames(configEnvs);
    configEnvs = ownProperties.reduce((res: any, p: any) => { res[p] = configEnvs[p]; return res; }, { });
}

type ProjectConfig = {
    FeatureSettings: Record<Environments, FeaturesSettingsType>,
    EmailSettings: Record<Environments, EmailSettingsType>,
    LinksSettings: Record<Environments, LinksSettingsType>,
    Client: ClientsSettingsType,
    PreActivatedAssessments?: AssessmentType[],
    AllowedForceLoginEmails?: string[];
};

const projectConfigs: ProjectConfig = app;

const env: Environments = IS_PROD ? 'production' : 'staging';

export const EmailSettings = projectConfigs?.EmailSettings[env];
export const FeatureSettings = projectConfigs?.FeatureSettings[env];
export const LinksSettings = projectConfigs?.LinksSettings[env];
export const ClientSettings = projectConfigs?.Client;
export const PreActivatedAssessments = projectConfigs?.PreActivatedAssessments;
export const AllowedForceLoginEmails = projectConfigs?.AllowedForceLoginEmails || [
    'demo@maslo.ai',
];

export const MobileStandaloneCoachEmail = 'demo@maslo.ai';