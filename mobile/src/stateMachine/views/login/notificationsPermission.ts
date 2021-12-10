import { ViewState } from '../base';
import AppController from 'src/controllers';
import { observer } from 'mobx-react';
import { ScenarioTriggers } from '../../abstractions';
import GoogleFit, { Scopes } from 'react-native-google-fit';

@observer
export class NotificationsPermissionView extends ViewState {

    async start() {
        const theme = this.theme;
        this.showModal({
            title: 'I can help you make checking-in a daily habit.',
            message: 'Would you like to enable notifications?',
            primaryButton: {
                text: 'turn on',
                action: this.askNtfPermissions,
            },
            secondaryButton: {
                text: 'skip',
                action: this.onSkip,
            },
            theme: theme,
        });
    }

    askNtfPermissions = () => this.runLongOperation(async () => {
        const enabled = await AppController.Instance.User.notifications.askPermission();

        if (enabled) {
            await AppController.Instance.User.notifications.enableNotifications();
        } else {
            await AppController.Instance.User.notifications.disableNotifications();
        }

        this.trigger(ScenarioTriggers.Submit);
    })

    onSkip = (): void | Promise<void> => this.runLongOperation(async () => {
        await AppController.Instance.User.notifications.disableNotifications();
        this.trigger(ScenarioTriggers.Submit);
    })

    renderContent() {
        return null;
    }
}
