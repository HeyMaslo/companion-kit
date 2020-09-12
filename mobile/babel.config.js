const appConfig = require('../config');

const envConfig = appConfig.getConfigVariables('.env', './package.json', false);
console.log(
    `[AppConfig] APP_ENV = ${appConfig.APP_ENV}, commit = ${appConfig.APP_HASH}`,
);

module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
        '@babel/plugin-syntax-dynamic-import',
        'replace-dynamic-import-runtime',
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        ['@babel/plugin-transform-flow-strip-types'],
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        ['transform-define', envConfig],
        [
            'module-resolver',
            {
                root: ['./src'],
                alias: {
                    src: './src',
                    common: '../common',
                    logger: '../common/logger.ts',
                },
            },
        ],
        ['babel-plugin-ts-nameof'],
    ],
};
