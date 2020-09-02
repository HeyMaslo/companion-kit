const webpack = require('webpack');
const path = require('path');
const MinifyPlugin = require('babel-minify-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const tsNameof = require('ts-nameof');
const helpers = require('./utils/webpack.helpers');
const appConfig = require('../config');
const Sitemap = require('./sitemap');

const devMode = process.env.NODE_ENV !== 'production';

const pathResolve = /** @arg {string} p */ (p) => path.resolve(__dirname, p);

const envConfigFlat = appConfig.getConfigVariables('.env', './package.json', true);

console.log(`[AppConfig] APP_ENV = ${appConfig.APP_ENV}, commit = ${appConfig.APP_HASH}, Hostname = ${Sitemap.Hostname}`);

const baseConfig = {
    context: path.resolve(),
    optimization: {
        minimizer: [
            new OptimizeCSSAssetsPlugin({})
        ],
    }
};

const definePlugin = new webpack.DefinePlugin(envConfigFlat);

const cleanupPlugin = /** @arg {boolean=} enable */ (enable) => ({
    name: 'clean',
    plugin: new CleanWebpackPlugin({}),
    enabled: enable,
});

const analyzePlugin = /** @arg {boolean=} enable */ (enable) => ({
    name: 'analyze',
    plugin: new BundleAnalyzerPlugin(),
    enabled: enable,
});

const miniCssPlugin = new MiniCssExtractPlugin({
    // Options similar to the same options in webpackOptions.output
    // both options are optional
    filename: devMode ? '[name].css' : '[hash:8].css',
    chunkFilename: devMode ? '[name].[id].css' : '[hash:8].[id].css',
});

const minifyJsPlugin = {
    name: 'minify',
    plugin: new MinifyPlugin({ mangle: { 'topLevel': true } }, { comments: false }),
    allowedEnv: 'production',
};

const getWebpackConfig = /** @arg {any} env */ (env) => {
    env = env || {};

    const minify = !!env.minify;
    const doAnalyze = !!env.analyze;
    const output = pathResolve(env.output || './dist');
    const htmlBuilder = new helpers.HtmlBuilder(minify);

    return Object.assign({}, baseConfig, {
        name: 'dashboard',
        devtool: devMode ? 'inline-source-map' : undefined,
        entry: pathResolve('./src/index.tsx'),
        output: {
            path: output,
            filename: devMode ? '[name].bundle.js' : '[hash:8].js',
            chunkFilename:  devMode ? '[name].bundle.[id].js' : '[hash:8].[chunkhash:6].js',
            publicPath: '/',
        },
        resolve: {
            extensions: [ '.ts', '.tsx', '.svg', '.png', '.js', '.jsx', '.ejs', '.json', '.html', '.sass' ],
            modules: [
                pathResolve('./src'),
                pathResolve('../common'),
                pathResolve('../mobile/dependencies'),
                'node_modules',

                // for resolving Node Modules referenced outside 'dashboard'
                pathResolve('./node_modules'),
            ],
            alias: {
                app: pathResolve('./src/app/'),
                common: pathResolve('../common/'),
                assets: pathResolve('./src/assets/'),
                dependencies: pathResolve('../mobile/dependencies/'),
                '@persona-core': pathResolve('../mobile/dependencies/persona/lib/index.ts'),
            },
        },
        module: {
            rules: [
                {
                    test: /\.(html|ejs)$/,
                    loader: 'underscore-template-loader',
                    query: {
                        attributes: [
                            'img:src',
                            'x-img:src',
                            'object:data',
                            'source:src',
                            'img:data-src',
                            'source:data-src',
                            'source:data-srcset',
                            'link:href',
                            'source:srcset',
                            'div:data-bodymovin-path',
                            'canvas:data-src',
                        ],
                    }
                },
                {
                    test: /\.tsx?$/,
                    use: [
                        'babel-loader',
                        {
                            loader: 'ts-loader',
                            options: {
                                getCustomTransformers: () => ({ before: [tsNameof] })
                            },
                        },
                        {
                            loader: "ifdef-loader",
                            options: {
                                ...appConfig.getAppFeatures(devMode ? 'staging' : 'production'),
                                'ifdef-verbose': devMode,
                            },
                        },
                    ],
                    exclude: [/node_modules/],
                },
                {
                    test: /\.(js|jsx)$/,
                    use: 'babel-loader',
                    exclude: [/node_modules/],
                },
                {
                    test: /\.(png|jpg|gif|webp|webm|svg|ico|xml|webmanifest)$/,
                    use: [ {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'assets/img',
                            esModule: false,
                        }
                    } ]
                },
                {
                    test: /\.(mp3)$/,
                    use: [ {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'assets/audio',
                            esModule: false,
                        }
                    } ]
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/,
                    use: [ {
                        loader: 'file-loader',
                        options: {
                            name: '[hash].[ext]',
                            outputPath: 'assets/fonts'
                        }
                    } ]
                },
                {
                    test: /\.(glsl|md)$/,
                    use: [{
                        loader: 'raw-loader',
                        options: {
                            esModule: false,
                        },
                    }],
                },
                {
                    test: /\.sass$|\.scss$|\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                modules: false,
                                importLoaders: 1,

                                // move inside 'modules' if needed
                                // localIdentName: devMode ? '[name]__[local]___[hash:base64:5]' : '[hash:base64:5]',
                            }
                        },
                        'sass-loader',
                    ],
                },
                {
                    test: /apple-app-site-association/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name]',
                                outputPath: '.well-known',
                            },
                        },
                    ],
                }
            ]
        },
        plugins: helpers.wrapPlugins([
            cleanupPlugin(true),
            definePlugin,
            ...Sitemap.pagesFlatten.map(p => htmlBuilder.createHtmlPlugin(p.output, p.templateName, {
                page: p,
                Hostname: Sitemap.Hostname,
            })),
            new webpack.optimize.ModuleConcatenationPlugin(),
            minifyJsPlugin,
            miniCssPlugin,
            analyzePlugin(doAnalyze),
        ]),
        optimization: {
            concatenateModules: false,
            splitChunks: {
                minSize: 100000,
                maxSize: 1000000,
                cacheGroups: {
                    // default: false,
                    vendors: {
                        reuseExistingChunk: true,
                    },
                    // Merge all the CSS into one file
                    styles: {
                        name: 'styles',
                        test: /\.s?css$/,
                        chunks: 'all',
                        enforce: true,
                    },
                },
            },
        },
        devServer: {
            contentBase: pathResolve('./dist'),
            host: '0.0.0.0',
            publicPath: '/',
            historyApiFallback: {
                index: 'index.html',
                rewrites: [
                    { from: /./, to: '/index.html'},
                ],
                verbose: true,
            },
            proxy: devMode ? helpers.createDevServerProxy(
                helpers.getFirebaseProjects(pathResolve('../server/.firebaserc')),
                'http://localhost:5001',
            ) : undefined,
            staticOptions: {
                extensions: [
                    'html'
                ],
            },
            headers: {
                'Access-Control-Allow-Origin' :'*',
            },
        },
    });
};

module.exports = getWebpackConfig;
