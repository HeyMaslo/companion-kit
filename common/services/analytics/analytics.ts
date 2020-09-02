export type EventData = {
    message: string,
};

export type UserInfo = {
    id: string,
    email: string,
    username: string,
};

export interface IAnalytics {
    userInfo: UserInfo;
    initialized: boolean;

    initialize: () => void;
    indentifyUser: (userData: UserInfo) => void;
    trackEvent: (event: EventData) => void;
    trackError: (error: any) => void;
}

let _current: IAnalytics = null;

export function InitAnalytics(instance: IAnalytics) {
    _current = instance;
}

export default {
    get Current(): IAnalytics { return _current; },
};