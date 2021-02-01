/** @typedef {(import ('./types').Env)} Env */

const config = require('./config');

/** @type Env */
const env = config.env
module.exports = { env }