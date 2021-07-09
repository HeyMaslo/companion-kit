import React from 'react';
import Colors from 'src/constants/colors';
import { View, StyleSheet, ViewStyle, StyleProp, Keyboard } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { ViewStateProps, ScenarioTriggers, IStateView, IPersonaViewContext } from '../abstractions';
import ModalView, { ModalProps, isModalButton } from './modalView';
import { PersonaViewPresets, PersonaStates, PersonaViewState } from '../persona';
import BaseStyles, { TextStyles, layout } from 'src/styles/BaseStyles';
import { PromiseWrapper } from 'common/utils/promiseWrapper';
import { createLogger } from 'common/logger';
import { safeCall } from 'common/utils/functions';
import { observable, transaction, reaction } from 'mobx';
import AppController from 'src/controllers';
import { Unsubscriber } from 'common/utils/unsubscriber';

type PersonaStateOverriders = 'globalProgress' | 'modal' | 'longOperation';

export abstract class ViewState<CState = {}, CParams = any> extends React.Component<ViewStateProps<CParams>, CState> implements IStateView {
    @observable.ref
    private modalSettings: ModalProps & { stateId?: number } = null;
    private _breakingPromise: PromiseWrapper;
    private _unmounted = false;

    // use it children to avoid unwanted autoFocus on inputs
    @observable
    protected allowInputAutoFocus = true;

    @observable
    protected contentAnimation: { animation: Animatable.Animation, duration: number, delay: number, style?: StyleProp<ViewStyle> } = null;

    @observable
    protected _progressCounter: number = 0;

    protected _contentHeight: number = 0;

    // To keep last persona state
    private readonly _personaStates: Partial<Record<PersonaStateOverriders, Partial<IPersonaViewContext>>> = { };
    private _lastPersonaStates: PersonaStateOverriders[] = [];

    private _modalPromiseResolver: PromiseWrapper;

    protected readonly disposer = new Unsubscriber();
    protected readonly logger = createLogger(`[${this.constructor.name}]`);

    protected get persona() { return this.props.context.persona; }

    /** @virtual */
    protected get unbreakable() { return false; }

    protected get enableGlobalProgressTracking() { return false; }
    protected get globalLoading() { return AppController.Instance.loading; }

    get baseStyles() { return BaseStyles; }
    get textStyles() { return TextStyles; }
    get layout() { return layout; }
    // get hasNotch() { return notch; }

    componentDidMount() {
        this.start();

        if (this.enableGlobalProgressTracking) {
            this.disposer.add(reaction(() => this.globalLoading, p => {
                this.logger.log('Global Progress =', p);
                if (p) {
                    Keyboard.dismiss();
                    this.allowInputAutoFocus = false;
                    this.hideModal();
                    this.savePersonaState('globalProgress', PersonaStates.Listen, PersonaViewPresets.Default);
                } else {
                    this.restorePersonaState('globalProgress');
                }
            }, { fireImmediately: true }));
        }
    }

    componentWillUnmount() {
        this._unmounted = true;

        this.disposer.dispose();

        this._breakingPromise?.resolve();
        this._breakingPromise = null;
        this._modalPromiseResolver?.resolve();
        this._modalPromiseResolver = null;

        this.end();
    }

    protected abstract start(): void;

    protected end(): void {
        /* virtual */
    }

    public cancelState = async () => {
        if (!this.unbreakable) {
            return;
        }
        this.allowInputAutoFocus = false;
        this.logger.log(' =====  Cancelling with breaking promise');
        this._breakingPromise = new PromiseWrapper();
        await this._breakingPromise.begin();
        this._breakingPromise = null;
    }

    protected get params() {
        return this.props.params as CParams;
    }

    protected trigger<T>(trigger: ScenarioTriggers, params?: T) {
        if (this._breakingPromise) {
            this.logger.log(' ======= SKIPPING TRIGGER, resolving breaking promise');
            this._breakingPromise.resolve();
        } else {
            this.props.triggerCalback(trigger, params);
        }
    }

    protected savePersonaState(id: PersonaStateOverriders, state: PersonaStates, view: PersonaViewState) {
        this._personaStates[id] = { state: this.persona.state, view: this.persona.view };
        this._lastPersonaStates.push(id);
        this.logger.log('savePersonaState: ', id, 'replaces current state', this.persona.state, 'with', state);
        this.resetPersona(state, view);
    }

    protected restorePersonaState(id: PersonaStateOverriders) {
        const s = this._personaStates[id];
        if (!s) {
            return;
        }

        delete this._personaStates[id];
        const lastState = this._lastPersonaStates[this._lastPersonaStates.length - 1] || null;

        if (lastState && id !== lastState) {
            this.logger.log('restorePersonaState', id, ': lastState mismatch, will be restored by', lastState);
            // last state should do this job
            this._personaStates[lastState] = s;
        } else {
            this.logger.log('restorePersonaState', id, ': resetting persona state to', s.state);
            this.resetPersona(s.state, s.view);
            if (lastState) {
                this._lastPersonaStates.pop();
            }
        }
    }

    showModal(settings: ModalProps, skipHide: boolean = false) {
        this.allowInputAutoFocus = false;

        this.hideModal();

        this._modalPromiseResolver = new PromiseWrapper();

        // automatically close modal on seconday button press
        if (isModalButton(settings.secondaryButton) && !skipHide) {
            const cb = settings.secondaryButton.action;
            settings.secondaryButton.action = () => {
                this.hideModal();
                safeCall(cb);
            };
        }

        // remember current persona position before opening modal
        this.logger.log('showModal');

        // const h = () => {
        //     const smallHeight = this.layout.window.height < 800;
        //     const msgLengthLimit = 170;
        //     const isMessageStringAndLong = settings.message && typeof(settings.message) === 'string' && settings.message.length > msgLengthLimit;

        //     if (smallHeight && isMessageStringAndLong) {
        //         return this.persona.setupContainerHeightForceScroll({ rotation: 360 });
        //     }
        //     return null;
        // };

        transaction(() => {
            // const modalContentHeight = h() || ModalView.MinContentHeight;
            const cfg = this.persona.getContainerHeight(ModalView.MinContentHeight);
            settings.contentHeight = cfg.height;
            this.savePersonaState('modal', PersonaStates.Question, cfg.view);
            this.modalSettings = settings;
        });

        return this._modalPromiseResolver.begin();
    }

    hideModal = () => {
        if (!this.modalSettings) {
            return;
        }

        this.logger.log('hideModal');

        transaction(() => {
            this.restorePersonaState('modal');
            this.modalSettings = null;
        });

        this._modalPromiseResolver?.resolve();
        this._modalPromiseResolver = null;
    }

    resetPersona = (state?: PersonaStates, view?: PersonaViewState) => {
        transaction(() => {
            this.persona.state = state || PersonaStates.Idle;
            this.persona.view = view || PersonaViewPresets.QuaterSmall;
        });
    }

    hidePersona = () => {
        this.persona.view = {
            ...this.persona.view,
            transparency: 1,
            rotation: 180,
            transition: { duration: 0.375 },
        };
    }

    protected get contentContainerStyles() { return styles.background; }

    protected fadeOuContent = (duration = 500, delay = 0) => {
        this.contentAnimation = { animation: 'fadeOut', duration, delay };
    }

    protected fadeInContent = (duration = 500, delay = 0) => {
        this.contentAnimation = { animation: 'fadeIn', duration, delay };
    }

    protected runLongOperation = async <T extends any>(worker: () => Promise<T>) => {
        if (this._personaStates.longOperation) {
            this.logger.log('WARNING: Runnig another long operation while previous hasn\'t been finished yet!');
        }

        this.allowInputAutoFocus = false;
        this.savePersonaState('longOperation', PersonaStates.Listen, PersonaViewPresets.Default);
        this._progressCounter++;
        try {
            const result = await worker();
            return result;
        } finally {
            if (!this._unmounted) {
                this._progressCounter--;
                this.restorePersonaState('longOperation');
            }
        }
    }

    abstract renderContent(): React.ReactNode;

    render() {
        const { animation = null, duration = 0, delay = 0 } = this.contentAnimation || { };

        const hasProgress = this._progressCounter > 0 || (this.enableGlobalProgressTracking && this.globalLoading);
        const contentContainerAnimation: Animatable.Animation = hasProgress ? 'fadeOut' : 'fadeIn';

        this.logger.log(
            'rendering with animation =', animation,
            'content animation', contentContainerAnimation,
            'allowAutoFocus =', this.allowInputAutoFocus,
        );

        return (
            <>
                {!this.modalSettings && (
                    <Animatable.View animation={contentContainerAnimation} duration={400} style={this.contentContainerStyles}>
                        <Animatable.View animation={animation} duration={duration} delay={delay}>
                            {this.renderContent()}
                        </Animatable.View>
                    </Animatable.View>
                )}
                {this.modalSettings && (
                    <View style={styles.background}>
                        <ModalView {...this.modalSettings} />
                    </View>
                )}
            </>
        );
    }
}

const styles = StyleSheet.create({
    background: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.pageBg,
    },
});
