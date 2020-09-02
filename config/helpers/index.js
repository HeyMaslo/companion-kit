const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const git = require('git-rev-sync');

const DefaultEnvironment = 'development';

/** @typedef {import('../declarations').Environments} Environments */
/** @typedef {import('../declarations').IncludeConfig} IncludeConfig */

// fill *required* env variables here. they might not exist, but should be listed anyway
const requiredEnv = {
    APP_ENV: process.env.APP_ENV || process.env.NODE_ENV || DefaultEnvironment,
    PAYMENT_DISABLED: process.env.PAYMENT_DISABLED,
    APP_HASH: git.short(),
    GA_TRACKING_ID: process.env.APP_ENV === 'production' ? 'UA-106568684-3' : null,
};

/** @typedef {Record<string, string | Object>} EnvironmentConfig */

/**
 * @arg {string} pathToEnv
 * @arg {string} pathToPackage
 * @arg {IncludeConfig[]} includeConfigs
 * @returns {EnvironmentConfig} */
function generateVariables(pathToEnv, pathToPackage, stringify = false, requiredVars = {}, includeConfigs = []) {
    const envResult = {};

    /** @type {Partial<typeof requiredEnv>} */
    let envLocal = {};
    if (pathToEnv && fs.existsSync(pathToEnv)) {
        envLocal = dotenv.parse(fs.readFileSync(pathToEnv));
    }

    // override envLocal with system env variables (only for known keys from requiredEnv)
    const finalRequiredVars = {
        ...requiredEnv,
        ...requiredVars,
    };
    Object.keys(finalRequiredVars).forEach(/** @arg {keyof typeof finalRequiredVars} k */ (k) => {
        const v = finalRequiredVars[k] || envLocal[k];
        if (v) {
            envLocal[k] = v;
        }
    });

    // generate correct keys for resulting envConfig, allowing to override with system values
    Object.keys(envLocal).forEach(k => {
        const resValue = process.env[k] || envLocal[k];
        envResult[k] = (resValue && stringify)
            ? JSON.stringify(resValue)
            : resValue;
    });

    const currentEnv = process.env.APP_ENV || envLocal.APP_ENV || DefaultEnvironment;

    let appVersion = null;

    if (pathToPackage) {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        const pckg = require(path.resolve(process.cwd(), pathToPackage));
        appVersion = pckg.version;
        if (appVersion && stringify) {
            appVersion = JSON.stringify(appVersion);
        }
    }

    /** @type {EnvironmentConfig} */
    const flatObject = {};
    Object.keys(envResult).forEach(k => {
        flatObject[`process.env.${k}`] = envResult[k];
    });

    includeConfigs.forEach(cfg => {
        if (cfg.recursiveFlat) {
            const cfgObj = getConfig(cfg.obj, currentEnv, false);
            Object.keys(cfgObj).forEach(k => {
                const value = (stringify && typeof cfgObj[k] == 'string')
                    ? JSON.stringify(cfgObj[k])
                    : cfgObj[k];

                flatObject[`process.${cfg.id}.${k}`] = value;
            });

        } else {
            flatObject[`process.${cfg.id}`] = getConfig(cfg.obj, currentEnv, stringify);
        }
    });

    if (appVersion) {
        flatObject['process.appVersion'] = appVersion;
    }

    return flatObject;
}

/**
 * @param {Record<Environments, any> | string} obj
 * @param {Environments} environment
 */
function getConfig(obj, environment, stringify = false, throwIfNotFound = true) {
    let config;
    if (typeof obj === 'string') {
        config = obj;
    } else {
        const env = environment;
        config = obj[env];
        if (!config) {
            if (throwIfNotFound) {
                throw new Error('Config not found for environment: ' + env + '; source: \r\n' + JSON.stringify(obj, null, 2));
            }
            return null;
        }
    }

    return stringify
        ? JSON.stringify(config)
        : config;
}

module.exports = {
    APP_ENV: requiredEnv.APP_ENV,
    APP_HASH: requiredEnv.APP_HASH,
    generateVariables,
};