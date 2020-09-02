const { Hostnames } = require('./hostname');


/** @typedef {any} SiteSection TODO */

/**
 * @typedef {Object} SitePage
 * @property {string} id will be used as `{id}/index.html` for output file name unless `outputFileName` was set up
 * @property {string} templateName
 * @property {string=} outputFileName 'index.html' or 'pageName/index.html'
 * @property {string} title
 * @property {string} description
 * @property {string} cannonical
 * @property {string} ogImage
 * @property {{ [sectionName: string ]: SiteSection}} sections
*/

/** @arg {SitePage[]} pages */
function createSitemap(pages) {
    /** @type {(SitePage & { output: string })[]} */
    const pagesFlatten = [];

    pages.forEach(page => {
        let path;

        if (page.outputFileName) {
            path = page.outputFileName;
        } else {
            path = `${page.id}/index.html`;
        }

        pagesFlatten.push({
            ...page,
            output: path,
        });
    });

    return {
        pages,
        pagesFlatten,
    };
}

module.exports = {
    createSitemap,
    Hostnames,
};
