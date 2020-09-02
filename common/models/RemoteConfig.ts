
import Identify from './Identify';

export type RemoteConfig = {
    billing_disabled: boolean;
    onboarding_form_enabled: boolean;
};

export const DefaultRemoteConfig: RemoteConfig = {
    billing_disabled: false,
    onboarding_form_enabled: false,
};

export type RemoteConfigIded = Identify<RemoteConfig>;
