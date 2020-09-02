import { ILogger, LoggerFunction, ConsoleLogger, IGenericLogger, LogLevels, LogHook } from './utils/logger';
import { AlertsLogger } from './utils/alertsLogger';

export { ILogger, LogLevels, LoggerFunction };

export const Enabled = process.env.NODE_ENV !== 'production' || process.env.APP_ENV !== 'production';
const USE_ALERT_LOGGER = false;

export function createLogger(name = '', forceDisable = false): ILogger & IGenericLogger {
    const enabled = forceDisable ? false : Enabled;
    return USE_ALERT_LOGGER
        ? new AlertsLogger(name, enabled)
        : new ConsoleLogger(name, enabled);
}

const logger = createLogger();

export default logger;

class LoggerHookError extends Error {
    private constructor(message: string, name: string = 'LoggerHookError') {
        super(message);
        this.name = name;
    }

    static create(args: any[]) {
        if (!args?.length) {
            return new LoggerHookError('Empty error message!');
        }

        const err: Error = args.find(a => a instanceof Error);
        if (err) {
            return err;
        }

        const message = args.map(s => typeof s === 'string' ? s : JSON.stringify(s))
            .join(' ');
        return new LoggerHookError(message);
    }
}

export function addGlobalLoggerErrorHook(hook: (e: Error) => any) {
    let _hookBlocked = false;
    ConsoleLogger.SetHook('error', function loggerErrorHook(...args: any[]) {
        if (_hookBlocked) {
            return;
        }

        _hookBlocked = true;
        hook(LoggerHookError.create(args));
        _hookBlocked = false;
    });
}
