import React from 'react';
import { View } from 'react-native';
import { createLogger } from 'common/logger';
import Colors from 'src/constants/colors';
import { IStateViewContext } from './abstractions';
import { PersonaView } from './persona';
import { ScenarioRunner } from './scenario.runner';
import { MasloScenario, currentState } from './scenario';
import { States } from './states';
import { ToasterView } from './toaster';
import { ViewContext } from './machine.context';

type Props = {
    paused?: boolean;
};

const logger = createLogger('[StateMachine]');

export function StateMachine(this: never, props: Props) {
    const [isRunning, setRunning] = React.useState(null as boolean);

    const viewContext = React.useMemo<IStateViewContext>(
        () => new ViewContext(),
        [],
    );

    const onActiveChanged = React.useCallback((active: boolean) => {
        logger.log('Scenario Runner changed active state:', active);

        setRunning(active);
    }, []);

    const onStateChanged = React.useCallback((s: States) => {
        currentState.value = s;
    }, []);

    return (
        <>
            <View style={{ backgroundColor: Colors.pageBg }}>
                <ScenarioRunner
                    onActiveChanged={onActiveChanged}
                    onStateChanged={onStateChanged}
                    context={viewContext}
                    scenario={MasloScenario}
                    stateFormatter={(s) => States[s]}
                />
                {isRunning && (
                    <PersonaView
                        context={viewContext.persona}
                        disabled={props.paused}
                    />
                )}
            </View>
            <ToasterView />
        </>
    );
}
