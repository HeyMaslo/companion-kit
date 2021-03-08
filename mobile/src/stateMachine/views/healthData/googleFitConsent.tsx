import { observer } from 'mobx-react';
import {Alert } from 'react-native';
import { ViewState } from '../base';
import AppController from 'src/controllers';
import { ScenarioTriggers } from '../../abstractions';
import logger from 'common/logger';


@observer
export class GoogleFitConsentView extends ViewState {
    async start() {
        this.showModal({
            title: 'We need your health data to build a better personalized experience for you.',
            message: 'Would you like to grant permission?',
            primaryButton: {
                text: 'Continue',
                action: this.askNtfPermissions,
            },
        });
    }

    askNtfPermissions = () => this.runLongOperation(async () => {
    const enabled = await AppController.Instance.User.hasHealthDataPermissions.askPermission();
      logger.log("in ASKNOTIFICATIONS : ", enabled);

      if (enabled) {
          await AppController.Instance.User.hasHealthDataPermissions.enableHealthPermissions();
      } else {
        Alert.alert(
           "We need your health data",
             "Change this in Settings",
         );   
      }
      this.trigger(ScenarioTriggers.Submit);
  })

    renderContent() {
        return null
    }
}