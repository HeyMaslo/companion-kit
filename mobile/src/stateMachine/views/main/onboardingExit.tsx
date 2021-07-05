import React from 'react';
import { observer } from 'mobx-react';
import { ViewState } from '../base';
import { PersonaViewPresets } from '../../persona';
import Onboarding from 'src/screens/components/OnboardingView';
import { PersonaStates, ScenarioTriggers } from '../../abstractions';
import AppViewModel from 'src/viewModels';
import { getOnboardingStep } from 'src/helpers/onboarding';
import { OnboardingSettings } from 'src/services/Onboading';
import logger from 'common/logger';
import AppController from 'src/controllers';
import { GlobalTrigger, GlobalTriggers } from '../../globalTriggers';

type State = {
    content: OnboardingSettings;
};

@observer
export class OnboardingExit extends ViewState<State> {
    state: State = {
        content: null,
    };

    private get checkInViewModel() {
        return AppViewModel.Instance.CreateCheckIn;
    }

    start() {
        const stepIndex = this.checkInViewModel.beforeSubmitState
            ?.onboardingIndex;

        if (
            stepIndex == null ||
            !process.appFeatures.MOBILE_ONBOARDING_ENABLED
        ) {
            this.trigger(ScenarioTriggers.Cancel);
            return;
        }

        const step = getOnboardingStep(stepIndex);

        if (step != null) {
            const content = step.after({
                cancel: () => this.trigger(ScenarioTriggers.Cancel),
                askNotificationsPermissions: this.askNtfPermissions,
            });
            this.setState({ content });
        } else {
            logger.log(
                `[OnboardingEnterState] No onboaring preset found for stepIndex: ${stepIndex}.`,
            );
            this.trigger(ScenarioTriggers.Back);
            return;
        }

        this.persona.view = PersonaViewPresets.Third;
        this.persona.state = PersonaStates.Joy;
    }

    askNtfPermissions = () =>
        this.runLongOperation(async () => {
            const enabled = await AppController.Instance.User.notifications.askPermission();
            logger.log('Asked permissions, result =', enabled);

            if (enabled) {
                await AppController.Instance.User.notifications.enableNotifications();
                logger.log('Firing GlobalTriggers.NotifictaionSettings');
                GlobalTrigger(GlobalTriggers.NotifictaionSettings);
            } else {
                this.trigger(ScenarioTriggers.Cancel);
            }
        });

    protected end() {
        this.checkInViewModel.clearBeforeSubmitState('onboardingIndex');
        this.checkInViewModel.cancel();
    }

    renderContent() {
        const { content } = this.state;

        if (!content) {
            return null;
        }

        return (
            <Onboarding content={content} personaViewContext={this.persona} />
        );
    }
}
