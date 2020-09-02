import { Tracker as GATrackerV1 } from './tracker';
import { IClientTracker, ClientTrackerConfig, TrackerEvent } from './abstractions';

import logger from 'common/logger';

export { ClientTrackerConfig };

GATrackerV1.overrideLogger(logger.log);

const KEEP_SESSIONS_TIMEOUT = 5 * 60 * 1000;

declare function setTimeout(handler: (...args: any[]) => void, timeout: number): number | NodeJS.Timeout;
declare function clearTimeout(handle: number | NodeJS.Timeout): void;

export abstract class ClientTracker implements IClientTracker {
    private _timeout: number | NodeJS.Timeout;
    private _tracker: GATrackerV1;
    private _windowBlurTime: Date = null;
    private _unlisten: () => void;

    abstract get currentTitle(): string;
    abstract get currentScreenName(): string;
    abstract get isHidden(): boolean;

    protected abstract getConfig(): Promise<ClientTrackerConfig>;

    async init(userId?: string) {
        const config = await this.getConfig();
        logger.log('[ClientTracker] Creating', config.trackingId, config.clientId, userId);
        if (config.trackingId) {
            this._tracker = new GATrackerV1(config.trackingId, config.clientId, userId)
                .setAppName(config.appName)
                .setAppVersion(config.appVersion)
                .setScreenSize(config.screenSize, config.viewportSize);
        }
    }

    private _resetTimeout() {
        this._stopTimeout();
        this._timeout = setTimeout(() => this.trackScreen(), KEEP_SESSIONS_TIMEOUT);
    }

    private _stopTimeout() {
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = null;
        }
    }

    updateUserId(userId: string) {
        if (this._tracker) {
            this._tracker.setUserId(userId);
        }
    }

    setOptions(opts: { userAgent?: string, documentReferrer?: string }) {
        if (this._tracker && opts.userAgent !== undefined) {
            this._tracker.setUserAgent(opts.userAgent);
        }

        if (this._tracker && opts.documentReferrer !== undefined) {
            this._tracker.setReferrer(opts.documentReferrer);
        }
    }

    trackScreen() {
        if (this._tracker) {
            this._tracker.trackScreenView(this.currentScreenName || 'home', this.currentTitle);
        }
        this._resetTimeout();
    }

    trackEvent(e: TrackerEvent) {
        if (this._tracker) {
            this._tracker.trackEvent(e);
        }
        this._resetTimeout();
    }

    protected enableScreenTrack(cb: () => void): () => void {
        return null;
    }

    beginSession() {
        if (this._tracker) {
            this._tracker.trackSessionStart(this.currentScreenName || 'home', this.currentTitle);
        }

        this._unlisten = this.enableScreenTrack(() => {
            // kostyl: wait for title is rendered to the page
            setTimeout(() => this.trackScreen(), 500);
        });

        if (!this.isHidden) {
            this._resetTimeout();
        }
    }

    endSession() {
        if (this._tracker) {
            this._tracker.trackSessionEnd(this.currentScreenName || 'home', 'exit');
        }
        this._stopTimeout();
    }

    trackAPICall(path: string, code: string, data: any = null) {
        this.trackEvent({
            category: 'dashboard/apicall',
            action: path,
            label: data,
            value: code,
        });
    }

    dispose() {
        this.endSession();
        if (this._unlisten) {
            this._unlisten();
            this._unlisten = null;
        }

        this._stopTimeout();
    }

    activate() {
        if (!this._windowBlurTime) {
            return;
        }

        // console.log('activate');
        const blurTime = this._windowBlurTime;
        const now = new Date();
        this._windowBlurTime = null;

        if (!blurTime || (now.getTime() - blurTime.getTime() > KEEP_SESSIONS_TIMEOUT / 2)) {
            this.trackScreen();
        } else {
            this._resetTimeout();
        }
    }

    deactivate() {
        if (this._windowBlurTime) {
            return;
        }

        // console.log('deactivate');
        this._windowBlurTime = new Date();
        this._stopTimeout();
    }
}

interface IConstructor<T> {
    new(): T;
}

export interface ITrackerFactory<TTracker extends IClientTracker = IClientTracker> {
    readonly Instance: TTracker;

    create(userId?: string, autoStart?: boolean): Promise<void>;
    destroy(): void;
}

export class TrackerFactory<TTracker extends IClientTracker> implements ITrackerFactory<TTracker> {

    private _instance: TTracker = null;
    public get Instance() { return this._instance; }

    constructor(private readonly ctor: IConstructor<TTracker>) {
    }

    public async create(userId?: string, autoStart = true) {
        this.destroy();
        this._instance = new this.ctor();

        await this._instance.init(userId);

        if (autoStart) {
            this.Instance.beginSession();
        }
    }

    public destroy() {
        if (this.Instance) {
            this.Instance.dispose();
            this._instance = null;
        }
    }
}