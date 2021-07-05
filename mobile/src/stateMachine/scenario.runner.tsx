import React from 'react';
import {
    IStateViewContext,
    ScenarioTriggers,
    GlobalScenario,
    IStateView,
    ViewStateProps,
    NavigationStates,
} from './abstractions';
import { Unsubscriber } from 'common/utils/unsubscriber';
import { GlobalTriggerEvent, GlobalTriggers } from './globalTriggers';
import { ConditionObserver, Conditions } from './conditions';
import { createLogger } from 'common/logger';
import { safeCall } from 'common/utils/functions';

type Props<T extends number> = {
    context: IStateViewContext;
    scenario: GlobalScenario<T>;
    onStateChanged?: (s: T) => any;
    onActiveChanged?: (active: boolean) => any;
    stateFormatter?: (s: T) => string;
};

type State<T extends number> = {
    currentState: T;
    currentParams: any;
};

const logger = createLogger('[Scenario]');

export class ScenarioRunner<T extends number> extends React.Component<
    Props<T>,
    State<T>
> {
    state: State<T> = {
        currentState: null as T,
        currentParams: null as any,
    };

    private readonly _unsubscriber = new Unsubscriber();

    private readonly _forceObservers: ConditionObserver[] = [];
    private readonly _currentStateObservers: ConditionObserver[] = [];

    private _nextRequestedState: T = null;
    private readonly _history: { state: T; params: any }[] = [];

    private _triggerParams: any = null;
    private _active = false;
    private _viewRef = React.createRef<
        IStateView & React.Component<ViewStateProps>
    >();

    private get scenario() {
        return this.props.scenario;
    }
    private get viewContext() {
        return this.props.context;
    }
    private get currentView() {
        return this.scenario[this.state.currentState]?.view;
    }

    componentDidMount() {
        logger.log('Initializing');

        if (this.scenario.startState) {
            this.changeState(this.scenario.startState, false, null);
        }

        this._unsubscriber.add(GlobalTriggerEvent.on(this._onGlobalTrigger));
        // can override start state
        this._enableForceTransitions();
    }

    componentWillUnmount() {
        this._unsubscriber.dispose();
        ScenarioRunner.ClearObservers(this._forceObservers);
        ScenarioRunner.ClearObservers(this._currentStateObservers);
    }

    private static ClearObservers(arr: ConditionObserver[]) {
        arr.forEach((o) => o.dispose());
        arr.length = 0;
    }

    private changeState = async (
        s: T,
        cancelPrevious: boolean,
        params: any,
    ) => {
        if (this.state.currentState === s) {
            this.setState({
                currentParams: { ...params, ...this._triggerParams },
            });
            return;
        }

        if (this._nextRequestedState != null) {
            logger.log(
                ` changeState --------- REPLACING NEXT STATE "${this._formatState(
                    this._nextRequestedState,
                )}" with "${this._formatState(s)}"`,
            );
            this._nextRequestedState = s;
            return;
        }

        this._nextRequestedState = s;

        ScenarioRunner.ClearObservers(this._currentStateObservers);

        if (cancelPrevious && this._viewRef.current) {
            logger.log(
                `changeState --------- Cancel previous ${
                    this.currentStateFormatted
                } to ${this._formatState(this._nextRequestedState)}`,
            );
            await this._viewRef.current.cancelState();
        }

        // clearing complete, enable next state
        const nextState = this._nextRequestedState;
        this._nextRequestedState = null;
        const prevState = this.state.currentState;

        if (this._enableTransitions(nextState)) {
            // this means that next state transitioned to another state already
            logger.log(
                `Transitioning SKIPPED ==== ${this._formatState(
                    prevState,
                )} => ${this._formatState(nextState)}`,
            );
            return;
        }

        logger.log(
            `Transitioning ==== ${this._formatState(
                prevState,
            )} => ${this._formatState(nextState)}`,
        );
        this._history.push({
            state: prevState,
            params: this.state.currentParams,
        });

        this._onStateApplied(nextState);
        this.setState({
            currentState: nextState,
            currentParams: { ...params, ...this._triggerParams },
        });

        this._triggerParams = null;
    };

    private _checkNavigationAndChangeState(
        s: T | NavigationStates,
        cancelPrevious: boolean,
        params: any,
    ) {
        let historyItem: { state: T; params: any };

        switch (s) {
            case NavigationStates.GoBack: {
                historyItem = this._history.pop();
                break;
            }

            default: {
                return this.changeState(s, cancelPrevious, params);
            }
        }

        if (!historyItem) {
            logger.error(
                'Failed to make state navigation transition:',
                NavigationStates[s],
            );
            return;
        }

        return this.changeState(
            historyItem.state,
            cancelPrevious,
            historyItem.params,
        );
    }

    private _enableForceTransitions() {
        ScenarioRunner.ClearObservers(this._forceObservers);

        const allStates = GlobalScenario.getAllStates(this.scenario);

        allStates.forEach((s) => {
            if (!s.enter) {
                return;
            }

            const observerName = s.log
                ? `[${this._formatState(s.state)}.ENTER]`
                : null;
            const createObserver = (
                c: Conditions.General & { params?: any },
            ) => {
                if (!c) {
                    return;
                }

                const o = new ConditionObserver(c, observerName);
                this._forceObservers.push(o);

                o.satisfied.on(() => this.changeState(s.state, true, c.params));
                o.forceCheck();
            };

            if (Array.isArray(s.enter)) {
                s.enter.forEach(createObserver);
            } else {
                createObserver(s.enter);
            }
        });
    }

    private _onGlobalTrigger = (t: GlobalTriggers) => {
        logger.log(' <><><><><><><> GOT GLOBAL TRIGGER:', GlobalTriggers[t], t);
        this._forceObservers.forEach((o) => o.trigger(t));
    };

    private _onStateApplied = (next: T) => {
        safeCall(this.props.onStateChanged, next);

        const nextView = this.scenario[next]?.view;
        const isActive = nextView != null;
        if (this._active !== isActive) {
            this._active = isActive;
            safeCall(this.props.onActiveChanged, this._active);
        }
    };

    private _enableTransitions = (state: T) => {
        const item = this.scenario[state];
        if (!item?.exit) {
            return false;
        }

        const transitions = item.exit
            .filter((e) => e)
            .sort((i1, i2) => (i1.priority || 0) - (i2.priority || 0));

        for (let i = 0; i < transitions.length; ++i) {
            const t = transitions[i];
            if (t.target === state) {
                continue;
            }

            const observerName = item.log
                ? `[${this._formatState(state)}.EXIT.${this._formatState(
                      t.target,
                  )}]`
                : null;
            const o = new ConditionObserver(t, observerName);
            this._currentStateObservers.push(o);

            let satisfied = false;
            o.satisfied.on(() => {
                satisfied = true;
                this._checkNavigationAndChangeState(t.target, false, t.params);
            });

            o.forceCheck();

            if (satisfied) {
                return true;
            }
        }

        return false;
    };

    private _onTrigger = (trigger: ScenarioTriggers, params?: any) => {
        this._triggerParams = params;
        const observers = this._currentStateObservers.slice();
        observers.some((o) => o.trigger(trigger));
    };

    render() {
        const ViewClass = this.currentView;

        logger.log(
            `Rendering "${ViewClass?.name}" for state ${this.currentStateFormatted} with params`,
            this.state.currentParams,
        );

        if (!ViewClass) {
            return null;
        }

        const { currentParams } = this.state;

        return (
            <ViewClass
                ref={this._viewRef}
                triggerCalback={this._onTrigger}
                context={this.viewContext}
                params={currentParams}
            />
        );
    }

    private get currentStateFormatted() {
        return this._formatState(this.state.currentState);
    }

    private _formatState = (s: T | NavigationStates): string => {
        if (s == null) {
            return 'null';
        }

        if (s === NavigationStates.GoBack) {
            return '<GO_BACK>';
        }

        if (this.props.stateFormatter) {
            return this.props.stateFormatter(s);
        }

        return `${s}`;
    };
}
