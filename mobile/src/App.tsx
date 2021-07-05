import React, { ErrorInfo } from 'react';
import {
    StatusBar,
    StyleSheet,
    View,
    AppState,
    AppStateStatus,
    Alert,
} from 'react-native';
import { AppLoading } from 'expo';
import { observer, Provider as MobxProvider } from 'mobx-react';
import * as Font from 'expo-font';
import 'mobx-react/batchingForReactNative';
import 'src/services/base64';
import './helpers/fixtimerbug';
import type {} from 'common/declarations/process'; // TS fix

import AppRouter from './navigation/AppRouter';
import { ProjectFonts } from './assets/fonts';
import { createLogger } from 'common/logger';
import AppController from './controllers';
import AsyncStorage from './services/StorageAsync';
import Firebase, {
    initializeAsync as initializeFirebaseAsync,
} from 'common/services/firebase';

import Env from 'src/constants/env';

import AudioManager from 'src/services/Audio';
import AppQueryService from 'src/services/AppQueryService';
import AnalyticsExpo from 'src/services/AnalyticsService';
import { InitAnalytics } from 'common/services/analytics/analytics';

// import {
//     SiriShortcutsEvent,
//     donateShortcut,
//     suggestShortcuts,
//     clearShortcutsWithIdentifiers,
//     getShortcuts,
//     ShortcutOptions,
// } from 'react-native-siri-shortcut';

const logger = createLogger('[APP]');

// const opts1: ShortcutOptions = {
//     activityType: 'com.maslo.evolution.SiriShortcutsModule.sayHello',
//     title: 'Say Hi',
//     userInfo: {
//         foo: 1,
//         bar: 'baz',
//         baz: 34.5,
//     },
//     keywords: ['kek', 'foo', 'bar'],
//     persistentIdentifier:
//     'com.maslo.evolution.SiriShortcutsModule.sayHello',
//     isEligibleForSearch: true,
//     isEligibleForPrediction: true,
//     suggestedInvocationPhrase: 'Say something',
//     needsSave: true,
// };

interface IAppProps {
    skipLoadingScreen?: boolean;
}

const CONFIRM_DEV_KEY = 'CONFIRM_DEV_KEY';

@observer
export default class App extends React.Component<IAppProps> {
    state = {
        isLoadingComplete: false,
    };

    componentDidMount() {
        AppState.addEventListener('change', this._onAppStateChanged);
        AppQueryService.prewarm();

        AudioManager.initialize();

        // SiriShortcutsEvent.addListener(
        //     'SiriShortcutListener',
        //     this.handleSiriShortcut.bind(this),
        // );
        // suggestShortcuts([opts1]);
        // this.updateShortcutList();
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._onAppStateChanged);
        AppQueryService.destroy();
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(error);
        this.processUnhandledError(error);
    }

    handleSiriShortcut({ userInfo, activityType }: any) {
        this.setState({
            shortcutInfo: userInfo,
            shortcutActivityType: activityType,
        });
    }

    // setupShortcut1() {
    //     donateShortcut(opts1);
    // }

    // async clearShortcut1() {
    //     try {
    //       await clearShortcutsWithIdentifiers([
    //         'com.maslo.evolution.SiriShortcutsModule.sayHello',
    //       ]);
    //       alert('Cleared Shortcut 1');
    //     } catch (e) {
    //       alert("You're not running iOS 12!");
    //     }
    // }

    // async updateShortcutList() {
    //     try {
    //       const shortcuts = await getShortcuts();

    //       this.setState({
    //         shortcuts,
    //       });
    //     } catch (e) {
    //       alert("You're not running iOS 12!");
    //     }
    // }

    private processUnhandledError(e: Error) {
        if (__DEV__) {
            return;
        }
        AppController.captureError(e);
    }

    _onAppStateChanged = (state: AppStateStatus) => {
        logger.log('AppState =', state);

        if (state === 'inactive') {
            return;
        }

        if (state === 'background') {
            AppController.Instance.setAppActive(false);
            return;
        }

        AppController.Instance.setAppActive(true);
    };

    render() {
        if (!this.props.skipLoadingScreen && !this.state.isLoadingComplete) {
            return (
                <AppLoading
                    startAsync={this._loadStuffAsync}
                    onError={this._handleLoadingError}
                    onFinish={this._handleFinishLoading}
                />
            );
        }

        return (
            <MobxProvider>
                <View style={styles.container}>
                    <StatusBar barStyle="light-content" hidden={true} />
                    <AppRouter />
                </View>
            </MobxProvider>
        );
    }

    private _loadStuffAsync = async () => {
        await Promise.all([
            this._loadResourcesAsync(),
            this._initializeControllers(),
        ]);
    };

    private async _initializeFirebase() {
        try {
            // prevent firebase re-init on react fast refersh
            if (!__DEV__ || !Firebase.isInitialized) {
                await initializeFirebaseAsync({
                    functionsEmulatorUrl: Env.Firebase.FunctionsEmulator,
                    firestoreEmulatorUrl: Env.Firebase.FirestoreEmulator,
                    config: Env.Firebase.Config,
                });
            }
        } catch (err) {
            console.warn('initializeFirebaseAsync error below:');
            console.error(err);
        }
    }

    private _initializeControllers = async () => {
        await this._initializeFirebase();

        this._onAppStateChanged(AppState.currentState);

        this.showDevAlert();

        const AnalyticsService = new AnalyticsExpo();
        InitAnalytics(AnalyticsService);
    };

    private _loadResourcesAsync = async () =>
        Promise.all([
            // Asset.loadAsync([
            // ]),
            Font.loadAsync({
                ...ProjectFonts,
            }),
        ]);

    private _handleLoadingError = (error) => {
        console.error(error);
        this.processUnhandledError(error);
    };

    private _handleFinishLoading = () => {
        this.setState({ isLoadingComplete: true });
    };

    private async showDevAlert() {
        if (!AppController.Instance.version.isDevelopment) {
            return;
        }

        const hasConfirmedDev = await AsyncStorage.getValue(CONFIRM_DEV_KEY);
        if (hasConfirmedDev) {
            return;
        }

        Alert.alert(
            'Warning',
            'This is development version of the app. Changes you will make may be lost or corrupted.',
            [
                {
                    text: 'OK',
                    style: 'cancel',
                },
                {
                    text: "Don't show again",
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.setValue(CONFIRM_DEV_KEY, 'true');
                    },
                },
            ],
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        position: 'relative',
    },
});
