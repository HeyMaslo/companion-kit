
export interface TrackerEvent {
    readonly category: string;
    readonly action: string;
    readonly label?: string;
    readonly value?: string;
}

export type ClientTrackerConfig = {
    trackingId: string;
    appName: string;
    appVersion: string;

    clientId: string;

    screenSize: string;
    viewportSize: string;
};

export interface IClientTracker {
    init(userId: string): Promise<void>;

    beginSession(): void;
    endSession(): void;

    trackScreen(): void;
    trackEvent(e: TrackerEvent): void;
    trackAPICall(path: string, code: string, data?: any): void;

    updateUserId(userId: string): void;

    activate(): void;
    deactivate(): void;

    dispose(): void;
}
