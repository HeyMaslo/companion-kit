/** @typedef {(import ('./types').Env)} Env */

/** @type Env */
export const env = {
    production: {
        firebase: {
            config: {
                apiKey: "...",
                authDomain: "...",
                databaseURL: "...",
                projectId: "...",
                storageBucket: "...",
                messagingSenderId: "...",
                appId: "...",
                measurementId: "..."
            },
            mobileConfig: {
                ios: {
                    appId: '...',
                    apiKey: '...',
                },
                android: {
                    appId: '...',
                    apiKey: '...',
                },
            },
            hostingConfig: {
                dashboard: '...', // url for dashboard
                web: '...', // url for website
            },
        },
        googleConfig: {
            ClientIdNative: '',
            ExpoClientIdAndroid: '...', // android app id
            ExpoClientIdIOS: '...' // ios app id,
        },
        integrationConfig: {
            SentryDsn: '...' // sentry url,
        },
    }
}