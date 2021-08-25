import { observer } from 'mobx-react';
import { ViewState } from '../base';
import AppController from 'src/controllers';
import { ScenarioTriggers } from '../../abstractions';

@observer
export class HealthConsentView extends ViewState {
    async start() {
        this.showModal({
            title: 'We need your health data to build a better personalized experience for you.',
            message: 'Would you like to grant permission?',
            primaryButton: {
                text: 'Continue',
                action: this.askHealthPermissions,
            },
            secondaryButton: {
                text: 'Skip',
                action: this.skip,
            },
        });
    }

    askHealthPermissions = () => this.runLongOperation(async () => {
        await AppController.Instance.User.hasHealthDataPermissions.askPermission();
        this.trigger(ScenarioTriggers.Submit);
    })

    skip = () => {
        this.trigger(ScenarioTriggers.Submit);
    }

    renderContent() {
        return null;
    }
}