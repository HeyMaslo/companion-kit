import Env from 'app/constants/env';
import { v4 as uuid4 } from 'uuid';
import { ClientTracker, TrackerFactory, ClientTrackerConfig } from 'common/services/analytics/clientTracker';

import history from './history';

import * as Events from './webTracker.events';

export { Events };

const CID_KEY = 'CLIENT_ID_KEY';
let ClientId = window.localStorage.getItem(CID_KEY);
if (!ClientId) {
    ClientId = uuid4();
    window.localStorage.setItem(CID_KEY, ClientId);
}

const AppName = process.env.APP_ENV === 'production'
    ? 'MasloCoach'
    : 'MasloCoachDev';

function getScreenSize() {
    return `${window.screen.width}x${window.screen.height}`;
}

function getViewportSize() {
    return `${window.innerWidth}x${window.innerHeight}`;
}

export class WebClientTracker extends ClientTracker {
    get currentTitle() { return window.document.title; }
    get currentScreenName() { return window.location.pathname; }
    get isHidden() { return window.document.hidden; }

    protected async getConfig(): Promise<ClientTrackerConfig> {
        return {
            trackingId: Env.GaTrackingId,
            appName: AppName,
            appVersion: Env.App.Version,
            clientId: ClientId,
            screenSize: getScreenSize(),
            viewportSize: getViewportSize(),
        };
    }

    protected enableScreenTrack(cb: () => void) {
        return history.listen(cb);
    }
}

const WebClientTrackerFactory = new TrackerFactory<WebClientTracker>(WebClientTracker);

export default WebClientTrackerFactory;
