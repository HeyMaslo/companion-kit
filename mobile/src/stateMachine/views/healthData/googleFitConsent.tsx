import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, View, Text, Platform, Image, Animated } from 'react-native';
import { ViewState } from '../base';
import AppController from 'src/controllers';
import Colors from 'src/constants/colors';
import Images from 'src/constants/images';
import Localization from 'src/services/localization';

import { Link, Button, MasloPage, AnimatedContainer } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import * as Features from 'common/constants/features';

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
                action: this.giveAccess,
            },
            secondaryButton: {
                text: 'Skip',
                action: this.skipAccess,
            },
        });
    }

    giveAccess = () => {
        this.trigger(ScenarioTriggers.Primary);
    }
    skipAccess = () => {
        this.trigger(ScenarioTriggers.Secondary);
    }

    renderContent() {
        const texts = Localization.Current.MobileProject;
        return (
            <MasloPage />
        );
    }
}