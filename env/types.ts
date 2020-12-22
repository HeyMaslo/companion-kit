import { FirebaseConfig } from '../common/services/firebase';
import { FirebasePlatformConfig } from '../common/declarations/process';
import { GoogleConfig } from '../common/declarations/process';
import { IntegrationConfigs } from '../common/declarations/process';

export type Env = {
    production: {
        firebase: {
            config: FirebaseConfig,
            mobileConfig: FirebasePlatformConfig,
            hostingConfig: {
                dashboard: string,
                web: string,
            },
        },
        googleConfig: GoogleConfig,
        integrationConfig: IntegrationConfigs,
    }
};