import {
    ClientTracker,
    TrackerFactory,
    ClientTrackerConfig,
} from 'common/services/analytics/clientTracker';
import Env from 'src/constants/env';
import { v4 as uuid4 } from 'uuid';

import { Dimensions, Platform } from 'react-native';
import ExpoConstants, { AppOwnership } from 'expo-constants';
import Storage from './StorageAsync';
import * as Events from './mobileTracker.events';

export { Events };

const CID_KEY = 'CLIENT_ID_KEY';
let ClientId: string;
const TRACK_KEY: string = 'TRACK_KEY';

const expoPostfix =
    ExpoConstants.appOwnership === AppOwnership.Expo ? '_expo' : '';
const AppName = 'MasloCoach_' + Platform.OS + expoPostfix;

const dimensions = Dimensions.get('screen');

async function getClientId() {
    if (ClientId) {
        return ClientId;
    }

    ClientId = await Storage.getValue(CID_KEY);
    if (!ClientId) {
        ClientId = uuid4();
        await Storage.setValue(CID_KEY, ClientId);
    }
    return ClientId;
}

async function _checkClientKey() {
    const hasValue = await Storage.hasValue(TRACK_KEY);
    if (!hasValue) {
        await Storage.setValue(TRACK_KEY, 'YES');
        return false;
    }
    return true;
}

function getScreenSize() {
    return `${dimensions.width}x${dimensions.height}`;
}

function getViewportSize() {
    return getScreenSize();
}

export class MobileClientTracker extends ClientTracker {
    get currentTitle() {
        return null;
    }
    get currentScreenName() {
        return `${Platform.OS}`;
    }
    get isHidden() {
        return false;
    }

    protected async getConfig(): Promise<ClientTrackerConfig> {
        return {
            trackingId: Env.GaTrackingId,
            appName: AppName,
            appVersion: Env.App.Version,
            clientId: await getClientId(),
            screenSize: getScreenSize(),
            viewportSize: getViewportSize(),
        };
    }

    async init() {
        await super.init();

        const userAgent = await ExpoConstants.getWebViewUserAgentAsync();
        if (userAgent) {
            this.setOptions({ userAgent: userAgent });
        }

        const hasValue = await _checkClientKey();
        if (!hasValue) {
            this.trackEvent(Events.FirstOpen);
        }
    }
}

const MobileClientTrackerFactory = new TrackerFactory<MobileClientTracker>(
    MobileClientTracker,
);

export default MobileClientTrackerFactory;
