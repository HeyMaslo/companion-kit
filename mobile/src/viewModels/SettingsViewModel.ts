import AppController from 'src/controllers';
import { SettingsNotificationsViewModel } from './SettingsNotificationsViewModel';
import { AuthProviders } from 'common/abstractions/controlllers/IAuthController';

export default class SettingsViewModel {
    public readonly notifications = new SettingsNotificationsViewModel();

    get authProvider() {
        return AppController.Instance.Auth.authUser
            ? AppController.Instance.Auth.authUser.currentProvider ===
              AuthProviders.Google
                ? 'google'
                : 'email'
            : null;
    }

    get needsCreatePassword() {
        return AppController.Instance.Auth.needsCreatePassword === true;
    }
    get disablePassword() {
        return AppController.Instance.Auth.needsCreatePassword == null;
    }

    public logout = async () => {
        await AppController.Instance.Auth.signOut();
    };
}
