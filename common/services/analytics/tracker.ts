import { TrackerEvent } from './abstractions';
import { QueryTracker } from './tracker.base';

export { TrackerEvent };

const TRACKING_URL = 'https://www.google-analytics.com/collect';
const API_VERSION = '1';

export type TrackingRawBaseData = {
    v: string,
    tid: string,
    uid: string,
    cid: string,
};

export type TrackingRawData = {
    uip?: string,
    ua?: string,
    an?: string,
    av?: string,
    sr?: string,
    vp?: string,
    dr?: string,

    dl?: string,
    dp?: string,
    dt?: string,

    cd?: string,

    ec?: string,
    ea?: string,
    el?: string,
    ev?: string,

    sc?: string,
};

export class Tracker extends QueryTracker {

    protected base: TrackingRawBaseData & TrackingRawData;

    constructor(trackingID: string, clientId: string, userId: string = null) {
        super();

        this.base = {
            v: API_VERSION,
            tid: trackingID,
            uid: userId,
            cid: clientId,
        };
    }

    protected get trackingUrl(): string { return TRACKING_URL; }

    setUserId(userId: string) {
        this.base.uid = userId;
        return this;
    }

    setReferrer(dr: string) {
        this.base.dr = dr;
        return this;
    }

    setIPOverride(ip: string) {
        this.base.uip = ip;
        return this;
    }

    setUserAgentOverride(userAgent: string) {
        this.base.ua = userAgent;
        return this;
    }

    setAppName(name: string) {
        this.base.an = name;
        return this;
    }

    setAppVersion(version: string) {
        this.base.av = version;
        return this;
    }

    setScreenSize(screenSize: string, viewportSize: string = null) {
        this.base.sr = screenSize;
        this.base.vp = viewportSize;
        return this;
    }

    trackPageView(locationUrl: string, title: string = null) {
        const data = {
            dl: locationUrl,
            dt: title || 'Hotspot',
        };
        this._hit('pageview', data);
    }

    trackScreenView(screenName: string, title: string = null) {
        const data = {
            dp: screenName,
            cd: screenName,
            dt: title,
        };
        this._hit('screenview', data);
    }

    trackEvent(e: TrackerEvent) {
        this._hit('event', {
            ec: e.category,
            ea: e.action,
            el: e.label || null,
            ev: e.value || null,
        });
    }

    trackSessionStart(currentPage: string, title: string = null) {
        this._hit('pageview', {
            sc: 'start',
            dp: currentPage,
            dt: title,
        });
    }

    trackSessionEnd(currentPage: string, title: string = null) {
        this._hit('pageview', {
            sc: 'end',
            dp: currentPage,
            dt: title,
        });
    }

    private _hit(type: 'pageview'|'screenview'|'event'|'exception', params: TrackingRawData): Promise<any> {
        const data = {
            ...this.base,
            t: type,
            ...params,
        };

        return this._doSend(data);
    }
}
