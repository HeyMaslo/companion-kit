const { resolve } = require('path');
const { getDefaultConfig } = require('metro-config');

const pr = (p) => resolve(__dirname, p);

module.exports = (async () => {
    const {
        resolver: { sourceExts, assetExts },
    } = await getDefaultConfig();

    return {
        projectRoot: resolve(__dirname),
        watchFolders: [pr('../common')],
        transformer: {
            babelTransformerPath: require.resolve('./metro.transformer.js'),
        },
        resolver: {
            assetExts: assetExts
                .filter((ext) => ext !== 'svg')
                .concat('md', 'glsl'),
            sourceExts: [...sourceExts, 'svg'],
            extraNodeModules: {
                // Here I reference my upper folder
                common: pr('../common'),
                dependencies: pr('./dependencies'),
                '@persona-core': pr('./dependencies/persona'),
                // Important, those are all the dependencies
                // asked by the "../common" but which
                // are not present in the ROOT/node_modules
                // So install it in your RN project and reference them here
                react: pr('node_modules/react'),
                mobx: pr('node_modules/mobx'),
                'computed-async-mobx': pr('node_modules/computed-async-mobx'),
                tslib: pr('node_modules/tslib'),
                '@babel/runtime': pr('node_modules/@babel/runtime'),
                firebase: pr('node_modules/firebase'),
                d3: pr('node_modules/d3'),
                qs: pr('node_modules/qs'),
                'libphonenumber-js': pr('node_modules/libphonenumber-js'),
            },
        },
    };
})();
