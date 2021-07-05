import * as ExpoUpdates from 'expo-updates';
import ExpoConstants, { AppOwnership } from 'expo-constants';
import { observable } from 'mobx';
import { createLogger } from 'common/logger';
import Env from 'src/constants/env';
import Storage from 'src/services/StorageAsync';

const logger = createLogger('[AppUpdates]');

function fc(str: string, skipEmpty = false) {
    if (!str) {
        return skipEmpty ? '' : '?';
    }
    return str[0];
}

const LAST_BUILD_VESION_KEY = 'LAST_BUILD_VERSION';

export class AppVersion {
    public static readonly Name = ExpoConstants?.manifest?.name;

    public static readonly Version = Env.App.Version;
    public static readonly Build = `${fc(Env.Current)}${fc(
        ExpoConstants?.manifest?.releaseChannel,
    )}${process.developVersion || ''} ${Env.App.Hash || '?'}`;
    public static readonly FullVersion = `${AppVersion.Name} v${AppVersion.Version}${AppVersion.Build}`;

    @observable
    private _next: boolean = null;

    get name() {
        return ExpoConstants?.manifest?.name;
    }
    get current() {
        return AppVersion.Version;
    }
    get hasNext() {
        return this._next;
    }

    get build() {
        return AppVersion.Build;
    }

    get fullVersion() {
        return AppVersion.FullVersion;
    }

    get isDevelopment() {
        return (
            Env.Current !== 'production' ||
            ExpoConstants?.manifest?.releaseChannel === 'default'
        );
    }

    public checkForUpdates = async () => {
        if (ExpoConstants?.appOwnership !== AppOwnership.Standalone) {
            return;
        }

        logger.log('Checking for App updates...');
        let nextSoftUpdate: number = null;
        const update = (await ExpoUpdates.checkForUpdateAsync()) as {
            isAvailable: boolean;
        };
        if (update && update.isAvailable) {
            const app = (await ExpoUpdates.fetchUpdateAsync()) as {
                manifest: typeof ExpoConstants.manifest;
            };
            this._next = true;
            logger.log('Got app version update:', app.manifest?.revisionId);
            nextSoftUpdate = +app.manifest?.extra?.softVersion || null;
        } else {
            this._next = null;
        }

        await this.tryForceUpdateApp(nextSoftUpdate);
    };

    public update = async (): Promise<void> => {
        if (!this._next) {
            return;
        }

        await ExpoUpdates.reloadAsync();
    };

    private async tryForceUpdateApp(nextSoftUpdate: number = null) {
        const lastVersion = await Storage.getValue(LAST_BUILD_VESION_KEY);
        const currentVersion = `${ExpoConstants?.nativeAppVersion} (${ExpoConstants?.nativeBuildVersion})`;
        const currentSoftVersion =
            +ExpoConstants?.manifest?.extra?.softVersion || 0;
        if (
            currentVersion !== lastVersion ||
            (nextSoftUpdate != null && nextSoftUpdate > currentSoftVersion)
        ) {
            await Storage.setValue(LAST_BUILD_VESION_KEY, currentVersion);
            await this.update();
        }
    }
}
