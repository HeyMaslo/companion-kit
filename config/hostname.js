// eslint-disable-next-line import/no-extraneous-dependencies
const { URL } = require('url');
const { ProjectConfigs, APP_ENV } = require('./index');

const Hostnames = ProjectConfigs.BuildConfigs[APP_ENV].hostname;

Object.keys(Hostnames).forEach(k => {
    let hn = Hostnames[k] || process.env.HOSTNAME || 'http://localhost/';
    if (hn.endsWith('/')) {
        hn = hn.substring(0, hn.length - 1);
    }
    console.log(`[Hostname] Current Hostname[${k}] = ${hn}`);
    Hostnames[k] = hn;
});


function combine(path, base) {
    return new URL(path, base).href;
}

module.exports = {
    Hostnames,

    combine,
};
