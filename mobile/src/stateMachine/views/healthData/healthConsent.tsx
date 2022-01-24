import { observer } from 'mobx-react';
import { ViewState } from '../base';
import AppController from 'src/controllers';
import { ScenarioTriggers } from '../../abstractions';

@observer
export class HealthConsentView extends ViewState {

    async start() {
        this.showModal({
            title: 'May I have your permission to access your health data?',
            message: 'Your health data is used to build a personalized experience. ',
            primaryButton: {
                text: 'Yes, Grant Permission',
                action: this.askHealthPermissions,
            },
            secondaryButton: {
                text: 'NO, skip for now',
                action: this.skip,
            },
            theme: this.theme,
        });
    }

    askHealthPermissions = () => this.runLongOperation(async () => {
        await AppController.Instance.User.healthPermissionsController.askPermission();
        this.trigger(ScenarioTriggers.Submit);
    })

    skip = () => {
        this.trigger(ScenarioTriggers.Submit);
    }

    renderContent() {
        return null;
    }
}