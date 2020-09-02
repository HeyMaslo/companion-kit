import { ConsoleLogger } from './logger';
// import console = require('console');

const doWarn = (...args: any[]) => {
    console.warn(...args);
    alert('[WARN] ' + args.map(a => JSON.stringify(a)).join(' '));
};

const doError = (...args: any[]) => {
    console.error(...args);
    alert('[ERROR] ' + args.map(a => JSON.stringify(a)).join(' '));
};

export class AlertsLogger extends ConsoleLogger {

    constructor(name: string, enabled = true) {
        super(name, enabled, {
            log: console.log,
            warn: doWarn,
            error: doError,
        });
    }
}