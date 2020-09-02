const Sitemap = require('../config/sitemap');

/** @typedef {Sitemap.SitePage} SitePage */

const Hostname = Sitemap.Hostnames.dashboard;

const faviconsArray = [
    {
        path: 'app/favicon.ico',
        rel: 'shortcut icon',
        sizes: '',
        color: '',
    },
    {
        path: 'app/favicon-16x16.png',
        rel: 'icon',
        sizes: '16x16',
        type: 'image/png',
        color: '',
    },
    {
        path: 'app/favicon-32x32.png',
        rel: 'icon',
        sizes: '32x32',
        type: 'image/png',
        color: '',
    },
    {
        path: 'app/apple-touch-icon.png',
        rel: 'apple-touch-icon',
        sizes: '180x180',
        color: '',
    },
    {
        path: 'app/safari-pinned-tab.svg',
        rel: 'mask-icon',
        sizes: '',
        color: '#4C40CF',
    },
    {
        path: 'app/app.webmanifest',
        rel: 'manifest',
        sizes: '',
        color: '',
    },
];

const HomeConfigs = {
    title: 'Companion kit Dashboard',
    description: 'Companion kit is an empathetic ai tool for anyone looking to grow in self development and self discovery. An on-the-go companion, right on your phone.',
    cannonical: Hostname,
    ogImage: 'og-image.png',
    twitterName: '',
    fbAppId: '',
    favicons: faviconsArray,
    inludeStripe: false,
    includeMailchimpSignupForm: false,
};

/** @type {SitePage} */
const Home = {
    id: 'home',
    templateName: 'src/html/index.ejs',
    outputFileName: 'index.html',
    sections: { },
    ...HomeConfigs,
};

module.exports = {
    ...Sitemap.createSitemap([Home]),
    Hostname,
}
