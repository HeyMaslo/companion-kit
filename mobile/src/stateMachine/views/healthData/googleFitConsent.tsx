import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, View, Text, Platform, Image, Animated, Alert } from 'react-native';
import { ViewState } from '../base';
import AppController from 'src/controllers';
import Colors from 'src/constants/colors';
import Images from 'src/constants/images';
import Localization from 'src/services/localization';

import { Link, Button, MasloPage, AnimatedContainer } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import * as Features from 'common/constants/features';
import GoogleFit, { Scopes } from 'react-native-google-fit';
import logger from 'common/logger';

const options = {
    scopes: [
      Scopes.FITNESS_ACTIVITY_READ,
    //   Scopes.FITNESS_ACTIVITY_WRITE,
    //   Scopes.FITNESS_BODY_READ,
    //   Scopes.FITNESS_BODY_WRITE,
    //   Scopes.FITNESS_LOCATION_READ,
      // Scopes.FITNESS_AUTH,
    ]
  }

@observer
export class GoogleFitConsentView extends ViewState {
    constructor(props) {
        super(props);
        // this._contentHeight = this.persona.setupContainerHeight(minContentHeight, { rotation: 405 });
    }

    // state = {
    //     opacity: new Animated.Value(0),
    // };

    async start() {
        this.showModal({
            title: 'We need your health data to build a better personalized experience for you.',
            message: 'Would you like to grant permission?',
            primaryButton: {
                text: 'Continue',
                action: Platform.OS == "android"? this.giveAccess : null,
            },
            secondaryButton: {
                text: 'Skip',
                action: this.onSkip,
            },
        });
    }

    giveAccess = () => {
        GoogleFit.authorize(options).then(authResult => {
            logger.log("IN AUTHORIZE", GoogleFit.isAuthorized)
            if (authResult.success) {
               this.trigger(ScenarioTriggers.Submit)
             } else {
                Alert.alert(
                    "Permissions Not Granted",
                    "We need your health data to enhance your experience with app, change this in settings by clicking the profile icon below"
                );
                this.trigger(ScenarioTriggers.Primary)
             }
            }).catch(() => {
                Alert.alert(
                  "AUTH_ERROR",
                  "Click Reload button to re-authorize.",
                  [
                    {
                      text: "Cancel",
                      onPress: () => {},
                      style: "cancel"
                    },
                    { text: "OK", onPress: () => Platform.OS == 'android'? this.giveAccess() : null }
                  ],
                  { cancelable: false }
                );
                return false;
            })

    }
    // onSkip = (): void | Promise<void> => this.runLongOperation(async () => {
    //     // await AppController.Instance.User.notifications.disableNotifications();
    //     this.trigger(ScenarioTriggers.Submit);
    // })

    // Vitor question
    onSkip = () => {
        Alert.alert(
            "AUTH_ERROR",
            "We need your health data for optimal App performance, Click Reload button to re-authorize.",
            [
            //   {
            //     text: "Cancel",
            //     onPress: () => {},
            //     style: "cancel"
            //   },
              { text: "RELOAD", onPress: () => this.giveAccess() }
            ],
            { cancelable: false }
          );
        // this.trigger(ScenarioTriggers.Submit);
    }
    renderContent() {
        return null
    }
}