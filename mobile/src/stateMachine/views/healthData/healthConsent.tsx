import { observer } from 'mobx-react';
import { ViewState } from '../base';
import AppController from 'src/controllers';
import { ScenarioTriggers } from '../../abstractions';
import logger from 'common/logger';


@observer
export class HealthConsentView extends ViewState {
    async start() {
        this.showModal({
            title: 'We need your health data to build a better personalized experience for you.',
            message: 'Would you like to grant permission?',
            primaryButton: {
                text: 'Continue',
                action: this.askNtfPermissions,
            },
            secondaryButton: {
                text: 'Skip for now',
                action: this.skip,
            },
        });
    }

    askNtfPermissions = () => this.runLongOperation(async () => {
    const enabled = await AppController.Instance.User.hasHealthDataPermissions.askPermission();
      logger.log("in ASKNOTIFICATIONS : ", enabled);
      this.trigger(ScenarioTriggers.Primary);
  })

    skip () {
      this.trigger(ScenarioTriggers.Submit);
    }

  renderContent() {
    return null;
}}