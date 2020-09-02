import qs from 'qs';
import { LoggerFunction } from 'common/logger';

const CAN_USE_BEACON = typeof window !== 'undefined' && window != null && !!window.navigator && !!window.navigator.sendBeacon;

export abstract class QueryTracker {

    protected static Logger: LoggerFunction = console.log;

    private _userAgent: string;
    protected LOG_LEVEL = 3;

    protected abstract get trackingUrl(): string;

    protected get useBeacon() { return CAN_USE_BEACON; }

    public static overrideLogger(logger: LoggerFunction) {
        QueryTracker.Logger = logger;
    }

    setUserAgent(ua: string) {
        this._userAgent = ua;
        return this;
    }

    protected getLogObj(full: any, params: any, nothing = '') {
        if (this.LOG_LEVEL <= 0) {
            return nothing;
        }
        if (this.LOG_LEVEL <= 1) {
            return params;
        }
        return full;
    }

    protected get fetchMethod(): ((url: string, options?: RequestInit) => Promise<any>) {
        return this.useBeacon
            ? ((url: string) => {
                const res = window.navigator.sendBeacon(url);
                return Promise.resolve(res);
            })
            : (url: string, options?: RequestInit) => {
                return fetch(url, options);
            };
    }

    protected async _doSend(data: any) {
        const query = qs.stringify(data, { skipNulls: true });
        const url = `${this.trackingUrl}?${query}`;

        const options = this._userAgent
            ? {
                method: 'get',
                headers: {
                    'User-Agent': this._userAgent,
                },
            } : undefined;

        try {
            await this.fetchMethod(url, options);
            QueryTracker.Logger('[Tracker] Success:', data.t, this.getLogObj(query, data));
        } catch (err) {
            QueryTracker.Logger('[Tracker] Fail:', data.t, this.getLogObj(query, data), err);
        }
    }
}
