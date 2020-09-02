

export type Environments = 'production' | 'staging' | 'development';

export type IncludeConfig = {
    id: string,
    obj: Record<Environments, any> | string,
    recursiveFlat?: boolean,
};

export type BuildConfig = {
    hostname: {
        dashboard: string,
        web: string,
    },
    mobile: {
        releaseChannel: string,
        configName: string,
    },
};

export type ProjectConfiguration = {
    BuildConfigs: Record<Environments, BuildConfig>,
    includeConfigs: IncludeConfig[],
}