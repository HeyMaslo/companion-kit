/** @typedef {(import ('./types').Env)} Env */

/** @type Env */
const env = {
    production: {
        firebase: {
            config: {
                apiKey: "${FB_WEB_API_KEY}",
                authDomain: "${FB_WEB_AUTH_DOMAIN}",
                databaseURL: "${FB_WEB_DB_URL}",
                projectId: "${FB_WEB_PROJECT_ID}",
                storageBucket: "${FB_WEB_STORAGE_BUCKET}",
                messagingSenderId: "${FB_WEB_MSG_SENDER_ID}",
                appId: "${FB_WEB_APP_ID}",
                measurementId: "${FB_WEB_MEASUREMENT_ID}"
            },
            mobileConfig: {
                ios: {
                    appId: '${FB_IOS_APP_ID}',
                    apiKey: '${FB_IOS_API_KEY}',
                },
                android: {
                    appId: '${FB_ANDROID_APP_ID}',
                    apiKey: '${FB_ANDROID_API_KEY}',
                },
            },
            hostingConfig: {
                dashboard: '${FB_HOSTING_DASHBOARD_URL}', // url for dashboard
                web: '${FB_HOSTING_WEB_URL}', // url for website
            },
        },
        googleConfig: {
            ClientIdNative: '${GOOGLE_CLIENT_ID_NATIVE}',
            ExpoClientIdAndroid: '${GOOGLE_CLIENT_ID_ANDROID}', // android app id
            ExpoClientIdIOS: '${GOOGLE_CLIENT_ID_IOS}' // ios app id,
        },
        integrationConfig: {
            SentryDsn: '${SENTRY_DSN}' // sentry url,
        },
    }
}

module.exports = { env }
