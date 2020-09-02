/** @typedef {import('./declarations').ProjectConfiguration} ProjectConfiguration */

const Helpers = require('./helpers');
/** @type {ProjectConfiguration} */
const AppConfig = require('./app');

/** @typedef {import('./declarations').Environments} Environments */
/** @typedef {(import ('../common/declarations/process').AppFeaturesConfig)} AppFeaturesConfig */

const ProjectConfigs = AppConfig;

/**
 * @param {string} pathToEnv
 * @param {string} pathToPackage
 */
function getConfigVariables(pathToEnv, pathToPackage, stringify = false, requiredVars = {}) {
    if (!ProjectConfigs) {
        throw new Error('Please add your project config file in the config/projects folder');
    }

    const includeConfig = ProjectConfigs.includeConfigs;
    const result = Helpers.generateVariables(pathToEnv, pathToPackage, stringify, requiredVars, includeConfig);

    return result;
}

/**
 * @param {Environments} env
 * @returns {Partial<AppFeaturesConfig>}
 */
function getAppFeatures(env) {
    const cfg = ProjectConfigs.includeConfigs.find(cfg => cfg.id === 'appFeatures');
    if (!cfg || typeof cfg.obj === 'string') {
        return { };
    }

    return cfg.obj[env];
}

module.exports = {
    getConfigVariables,
    getAppFeatures,
    ProjectConfigs,
    APP_ENV: Helpers.APP_ENV,
    APP_HASH: Helpers.APP_HASH,
};
