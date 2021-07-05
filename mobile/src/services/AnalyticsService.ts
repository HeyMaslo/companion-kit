import * as Sentry from 'sentry-expo';
import { reaction } from 'mobx';

import {
    IAnalytics,
    UserInfo,
    EventData,
} from 'common/services/analytics/analytics';
import Env from 'src/constants/env';
import { createLogger } from 'common/logger';
import AppController from 'src/controllers';

const logger = createLogger('[Analytics]');

class AnalyticsExpo implements IAnalytics {
    userInfo: UserInfo;
    initialized: boolean = false;

    constructor() {
        this.initialize();

        reaction(
            () => AppController.Instance.User?.user,
            (user) => {
                if (!user) {
                    return;
                }

                const { id, displayName, email } = user;

                this.indentifyUser({ id, email, username: displayName });
            },
        );
    }

    initialize = () => {
        if (Env.SentryDSN) {
            Sentry.init({
                dsn: Env.SentryDSN,
                enableInExpoDevelopment: false,
            } as Sentry.ReactNativeOptions);
        }

        this.initialized = true;
    };

    indentifyUser = (userData: UserInfo) => {
        if (userData) {
            const { id, username, email } = userData;
            const appVersion = AppController.Instance.version?.current;

            if (!__DEV__) {
                // To prevent Segment from spamming during development
                // this.Segment.identifyWithTraits(id, { username, email, appVersion });
            }

            Sentry.configureScope((scope) => {
                scope.setUser({ username, email, id });
            });

            Sentry.setRelease(appVersion);

            this.userInfo = userData;
        }
    };

    trackEvent = (event: EventData) => {
        if (!this.initialized) {
            return;
        }

        Sentry.captureMessage(event.message);
        // Firebase.Instance.analytics.logEvent('custom');
    };

    trackError = (error: any) => {
        if (!this.initialized) {
            return;
        }

        Sentry.captureException(error);

        if (__DEV__) {
            console.log('[AnalyticsExpo] Captured error', error);
        }
    };
}

export default AnalyticsExpo;
