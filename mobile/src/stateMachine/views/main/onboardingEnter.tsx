import React from 'react';
import { ViewState } from '../base';
import Onboarding from 'src/screens/components/OnboardingView';
import { PersonaViewPresets, PersonaStates } from '../../persona';
import { setTimeoutFramesAsync } from 'common/utils/async';
import { getOnboardingStep, StepsCount } from 'src/helpers/onboarding';
import { OnboardingSettings } from 'src/services/Onboading';
import AppContorller from 'src/controllers';
import AppController from 'src/controllers';
import { ScenarioTriggers } from '../../abstractions';
import logger from 'common/logger';

type State = {
    content: OnboardingSettings;
    stepIndex: number;
};

export class OnboardingEnter extends ViewState<State> {
    state: State = {
        content: null,
        stepIndex: null,
    };

    protected end() {
        AppController.Instance.User.onboardingSeen();
    }

    async start() {
        const stepIndex = AppContorller.Instance.User.onboardingDayIndex;
        const step = getOnboardingStep(stepIndex);
        logger.log(
            '[OnboardingEnter] stepIndex =',
            stepIndex,
            ', step != null: ',
            step != null,
        );

        if (stepIndex == null || step == null) {
            this.cancel();
            return;
        }

        const content = step.before({
            cancel: this.cancel,
            createStory: () => this.trigger(ScenarioTriggers.Primary),
        });

        this.setState({ stepIndex, content });

        await this.initPersona();
    }

    private cancel = () => {
        this.trigger(ScenarioTriggers.Cancel);
    };

    private async initPersona() {
        this.persona.view = {
            ...PersonaViewPresets.TopHalfOut,
            transition: {
                duration: 0.6,
            },
        };
        await setTimeoutFramesAsync(20);
        this.persona.state = PersonaStates.Idle;
    }

    renderContent() {
        const { content, stepIndex } = this.state;
        if (!content) {
            return null;
        }

        return (
            <Onboarding
                content={content}
                stepIndex={stepIndex + 1}
                totalCount={StepsCount}
                personaViewContext={this.persona}
            />
        );
    }
}
