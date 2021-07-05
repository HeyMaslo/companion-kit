import React from 'react';
import { ViewState } from '../base';
import { PersonaStates, ScenarioTriggers } from '../../abstractions';
import { TransitionObserver } from 'common/utils/transitionObserver';
import { PersonaViewPresets } from '../../persona';
import { MasloPage } from 'src/components';

export class StartView extends ViewState {
    protected get unbreakable() {
        return true;
    }

    async start() {
        this.persona.view = PersonaViewPresets.Default;

        this.persona.state = PersonaStates.Init;
        new TransitionObserver(() => this.persona.state)
            .to(PersonaStates.Idle)
            .fireOnce()
            .cb(() => this.trigger(ScenarioTriggers.Primary));
    }

    renderContent() {
        return <MasloPage />;
    }
}
