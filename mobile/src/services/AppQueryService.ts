import { createLogger } from 'common/logger';
import { ParsedURL } from 'expo/build/Linking/Linking.types';
import { Linking } from 'expo';
import { observable, transaction } from 'mobx';
import Lazy from 'common/utils/lazy';

export type AppQueryParameters = {
    oobCode?: string;
    mode?: string;
    appParams?: { [x: string]: string };
};

const logger = createLogger('[AppQueryService]');

export interface IAppQueryService {
    readonly currentUrl: string;
    readonly pathname: string;
    readonly query: Readonly<AppQueryParameters>;

    addAppParams(url: string, params: { [x: string]: string }): string;
}

export class AppQueryService implements IAppQueryService {
    private _deepLinkReceivedTime: number = null;

    @observable
    private _currentUrl: string = null;

    @observable
    private _pathname: string = null;

    @observable
    private _query: AppQueryParameters = {};

    constructor() {
        Linking.addEventListener('url', this._onDeepLinkHandler);
        Linking.getInitialURL().then((url) => this._onDeepLinkHandler({ url }));
    }

    public get currentUrl() {
        return this._currentUrl;
    }
    public get pathname() {
        return this._pathname;
    }
    public get query(): Readonly<AppQueryParameters> {
        return this._query;
    }

    private _onDeepLinkHandler = (e: { url: string }) => {
        // work around for multiple link received
        const now = new Date().getTime();
        const elapsed = this._deepLinkReceivedTime
            ? now - this._deepLinkReceivedTime
            : Number.MAX_VALUE;
        this._deepLinkReceivedTime = now;

        if (elapsed < 1000) {
            return;
        }

        if (!e.url) {
            return;
        }

        const result: ParsedURL = e.url && Linking.parse(e.url);
        logger.log('__PARSED LINK', result);

        const params: AppQueryParameters = {};

        if (result.queryParams?.link) {
            const linkParsed = Linking.parse(result.queryParams.link);
            params.mode = linkParsed.queryParams?.mode;
            params.oobCode = linkParsed.queryParams?.oobCode;

            if (linkParsed?.queryParams?.continueUrl) {
                const continueUrlParsed = Linking.parse(
                    linkParsed?.queryParams?.continueUrl,
                );
                params.appParams = continueUrlParsed?.queryParams;
            }
        } else {
            params.appParams = result.queryParams || {};
        }

        transaction(() => {
            this._currentUrl = e.url;
            this._query = params;
            this._pathname = result.path;
        });
    };

    addAppParams(url: string, params: { [x: string]: string }) {
        const query = Object.keys(params || {})
            .map((k) => `${k}=${params[k]}`)
            .join('&');
        return query ? `${url}?${query}` : url;
    }

    dispose() {
        Linking.removeEventListener('url', this._onDeepLinkHandler);
    }
}

const _instance = new Lazy(() => new AppQueryService());

export default {
    get Instance(): IAppQueryService {
        return _instance.value;
    },
    prewarm() {
        _instance.prewarm();
    },
    destroy() {
        if (_instance.hasValue) {
            _instance.value.dispose();
        }
        _instance.reset();
    },
};
