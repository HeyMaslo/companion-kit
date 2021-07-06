import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { reaction } from 'mobx';
import {
    MasloPersonaExpo,
    PersonaViewState,
    PersonaArmState,
    States as PersonaStates,
    IPersonaContext,
    PersonaSettings,
    CurrentPersonaSettings,
} from 'dependencies/persona/expo';
import { Domains as PersonaDomains } from 'dependencies/persona/lib/domains';
import { IPersonaViewContext } from './abstractions';
import Colors from 'src/constants/colors';
import Layout from 'src/constants/Layout';
import * as Haptics from 'src/services/haptics';

// FIREBASE & EXPO-THREE COMPATIBILITY HOTFIX
(global as any).Image = undefined;

export { PersonaStates, PersonaViewState, PersonaArmState, IPersonaContext, PersonaSettings, CurrentPersonaSettings, PersonaDomains };

export const PersonaViewPresets: { [name: string]: PersonaViewState } = {
    Default: {
        scale: 1,
        rotation: 0,
        position: { x: 0, y: 0 },
        anchorPoint: { x: 0, y: 0 },
        debugName: 'Default',
    },
    TopHalfOut: {
        scale: 1,
        rotation: 405,
        position: { x: 0, y: '50%' },
        anchorPoint: { x: 0, y: 0 },
        debugName: 'TopHalfOut',
    },
    QuaterSmall: {
        scale: 1,
        rotation: 45,
        position: { x: 0, y: '25%' },
        anchorPoint: { x: 0, y: 0.5 },
        debugName: 'QuaterSmall',
    },
    Third: {
        scale: 1, rotation: 405,
        position: { x: 0, y: '18%' },
        anchorPoint: { x: 0, y: 0.5 },
        debugName: 'Third',
    },
};

export const PersonaScale = 1 / 3;

const { height, width } = Dimensions.get('window');

export function getPersonaRadius(scale?: number): number {
    return ((scale || PersonaScale) * Math.min(width, height) / 2) / (devicePixelRatio +1);
} 

type Props = {
    context: IPersonaViewContext,
    disabled?: boolean,
};

export function PersonaView(this: void, props: Props) {

    React.useEffect(() => reaction(() => props.context.state, s => {
        switch (s) {
            case PersonaStates.Idle: {
                // nothing
                break;
            }

            case PersonaStates.Init: {
                Haptics.notification(Haptics.NotificationFeedbackType.Success);
                break;
            }

            default: {
                Haptics.impact(Haptics.ImpactFeedbackStyle.Light);
                break;
            }
        }
    }, { fireImmediately: true }));

    return (
        <View key='111' style={styles.personaWrapper} pointerEvents={'none'}>
            <MasloPersonaExpo
                context={props.context}
                disabled={props.disabled}
                personaSettings={{ colors: PersonaColors }}
                staticScale={PersonaScale}
            />
        </View>
    );
}

const PersonaColors = Colors.personaColors;

const styles = StyleSheet.create({
    personaWrapper: {
        width: Layout.window.width,
        height: Layout.window.height,
        left: 0,
        top: 0,
        position: 'absolute',
        zIndex: 100,
    },
    // personaWrapper: {
    //     width: Layout.window.width,
    //     height: Layout.window.height,
    //     zIndex: 100,
    //     marginTop: -Layout.window.height,
    // },
});