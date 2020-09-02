// eslint-disable-next-line import/no-extraneous-dependencies
const HtmlWebPackPlugin = require('html-webpack-plugin');
const fs = require('fs');
const path = require('path');

/**
 * @typedef {Object} Plugin
 */


/**
 * @param {string} p relative path
 * @returns {string} absolute path
 */
function pathResolve(p) {
    return path.resolve(__dirname, p);
}

class HtmlBuilder {
    constructor(minify = false) {
        this.htmlMinifyOptions =  minify
            && {
                removeAttributeQuotes: true,
                collapseWhitespace: false,
                html5: true,
                minifyCSS: true,
                removeComments: true,
                removeEmptyAttributes: true,
            };
    }

    /**
     * @arg {string} outputName
     * @arg {string} templatePath
     * @returns {HtmlWebPackPlugin}
     * */
    createHtmlPlugin(outputName, templatePath, options = {}) {
        return new HtmlWebPackPlugin({
            filename: outputName,
            cache: false,
            template: templatePath,
            minify: this.htmlMinifyOptions,
            inject: true,
            ...options,
        });
    }

    /** @returns {HtmlWebPackPlugin[]}
     */
    generateHtmlPlugins(templateDir = './app/html/', options = {}) {
        const templateFiles = fs.readdirSync(pathResolve(templateDir));

        return templateFiles
            .map(item => {
                const parts = item.split('.');
                const ext = parts.pop();

                if (ext !== 'html' && ext !== 'ejs')
                    return null;
                const name = parts.join().toLowerCase();

                const outputName = name === 'index' ? 'index.html' : `${name}/index.html`;
                const templatePath = pathResolve(`${templateDir}/${item}`);

                return this.createHtmlPlugin(outputName, templatePath, options);
            })
            .filter(p => p);
    }
}

/**
 * @param {({name:string,plugin:Plugin,allowedEnv:string,enabled:boolean}|Plugin)[]} plugins
 * @returns {Plugin[]}
 */
function wrapPlugins(plugins) {
    return plugins.filter(pp => {
        if (!pp.name || !pp.plugin) {
            return true;
        }

        if (process.argv.indexOf(`--disable-${pp.name}-plugin`) >= 0) {
            console.log(`[Webpack Config] Skipping plugin '${pp.name}' because it was explicitly disabled by cl args.`);
            return false;
        }

        if (pp.allowedEnv && process.env.NODE_ENV !== pp.allowedEnv) {
            console.log(`[Webpack Config] Skipping plugin '${pp.name}' because it was disabled by NODE_ENV. Allowed = ${pp.allowedEnv}, current = ${process.env.NODE_ENV}`);
            return false;
        }

        if (pp.enabled !== undefined && typeof pp.enabled === 'boolean') {
            if (!pp.enabled) {
                console.log(`[Webpack Config] Skipping plugin '${pp.name}' because it was explicitly disabled by option.`);
            }

            return pp.enabled;
        }

        return true;
    }).map(pp => (pp.name ? pp.plugin : pp));
}

/**
 * @param {string} name
 * @param {string=} fallback
 * @param {boolean=} forceFallback
 */
function getEnvVar(name, fallback = undefined, forceFallback = false) {
    const r = forceFallback
        ? fallback
        : (process.env[name] || fallback);
    return r ? JSON.stringify(r) : undefined;
}

/**
 * @param {string} path
 */
function getFirebaseProjects(path) {
    try {
        const str = fs.readFileSync(path, 'utf8');
        const obj = JSON.parse(str);
        if (obj && obj.projects) {
            const res = Object.values(obj.projects);
            console.log('getFirebaseProjects: Loaded ', res);
            return res;
        }

        return [];
    } catch (err) {
        console.error('getFirebaseProjects ERROR:', err);
    }
}

const ProxyTimeoutMs = 600 * 1000;

/**
 * @param {string[]} keys
 * @param {string} target
 */
function createDevServerProxy(keys, target) {
    /** @type {Object.<string, any>} */
    const res = { };
    keys.forEach(k => {
        res[`/${k}`] = {
            target,
            proxyTimeout: ProxyTimeoutMs,
            timeout: ProxyTimeoutMs,
            onProxyReq: (proxyReq, req, res) => req.setTimeout(ProxyTimeoutMs),
        };
    });

    console.log('Created DEV SERVER PROXY:', res);

    return res;
}

module.exports = {
    HtmlBuilder,
    pathResolve,

    wrapPlugins,
    getEnvVar,
    getFirebaseProjects,
    createDevServerProxy,
};
