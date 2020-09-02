import qs from 'qs';
import { createLogger } from 'common/logger';

export type AppQuery = {
    email?: string,
    plan?: string,
    period?: string,
    appAction?: string,
};

const logger = createLogger('[AppQuery]');

const getSearchPath = (url: string) => {
    const i = url ? url.indexOf('?') : -1;
    return i >= 0 ? url.substring(i + 1) : '';
};

export function parse(urlSearch = window.location.search): AppQuery {
    const raw = qs.parse(urlSearch, { ignoreQueryPrefix: true }) || {};
    const res = raw as AppQuery;

    if (raw?.continueUrl) {
        const continueUrlQ = qs.parse(getSearchPath(raw.continueUrl));
        res.appAction = continueUrlQ?.appAction;
    }

    return res;
}

export function appendParams(url: string, q: Partial<AppQuery>) {
    const parsed = new URL(url);

    Object.keys(q).forEach((k: keyof AppQuery) => {
        parsed.searchParams.append(k, q[k]);
    });

    return parsed.href;
}

function parseDefault() {
    try {
        const result = parse();
        logger.log('App initial query:', result);
        return result;
    } catch (err) {
        logger.error('Failed to parse qs', err);
        return null;
    }
}

export const Current = parseDefault();

export default {
    get Current() { return Current; },
};
