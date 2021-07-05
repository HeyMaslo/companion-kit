const upstreamTransformer = require('metro-react-native-babel-transformer');

const typescriptTransformer = require('react-native-typescript-transformer');
const svgTransformer = require('react-native-svg-transformer');

module.exports.transform = function ({ src, filename, options }) {
    /** @type {(arg: { src: string, filename: string, options: any }) => any} */
    let transformer;
    let name = null;

    if (/\.tsx?$/.test(filename)) {
        // name = 'typescript';
        transformer = typescriptTransformer.transform;
    } else if (/\.svg$/.test(filename)) {
        // name = 'svg';
        transformer = svgTransformer.transform;
    } else {
        // name = 'default';
        transformer = upstreamTransformer.transform;
    }

    if (name) {
        console.log(
            `[Metro.Transformer] '${name}' transformer has been used for file:`,
            filename,
        );
    }
    return transformer({ src, filename, options });
};
