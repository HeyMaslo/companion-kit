import { IPersonaContext, PersonaStates, PersonaViewState } from './persona';
import { Conditions } from './conditions';
import { ScreenRect } from 'react-native';

export { PersonaStates };

export enum ScenarioTriggers {
    Back = 1,
    Cancel,
    Submit,
    Primary,
    Secondary,
    Tertiary,
    Next,
    Quaternary,
}

export enum NavigationStates {
    GoBack = -1,
}

export interface IPersonaViewContext extends IPersonaContext {
    getContainerHeight(
        minHeight: number,
    ): { height: number; view: PersonaViewState };
    getScrollContainerHeight(): { height: number; view: PersonaViewState };

    setupContainerHeight(
        minHeight: number,
        view?: Partial<PersonaViewState>,
    ): number;
    setupContainerHeightForceScroll(view?: Partial<PersonaViewState>): number;
    setupContainerHeightForceScrollDown(
        view?: Partial<PersonaViewState>,
    ): number;
}

export interface IStateContext {
    readonly persona: IPersonaContext;
}

export type KeyboardState = ScreenRect & { isOpened: boolean };

export interface IStateViewContext extends IStateContext {
    readonly persona: IPersonaViewContext;
    readonly keyboard: Readonly<KeyboardState>;
}

export type ViewStateProps<TParams = any> = {
    context: IStateViewContext;
    triggerCalback: (trigger: ScenarioTriggers, params?: any) => void;
    params?: TParams;
};

export interface IStateView extends React.Component<ViewStateProps> {
    cancelState(): Promise<void> | void;
}

type ConditionWithParams = Conditions.General & { params?: any };

export type StateItem<T extends number> = {
    /** Component class that should render this state */
    view: { new (props: ViewStateProps, context?: any): IStateView };

    /** Exit transitions to another states */
    exit?: StateTransition<T>[];

    /** Conditions for force transitioning to this state */
    enter?: ConditionWithParams | ConditionWithParams[];

    /** Enables logging inside Condition Observers */
    log?: boolean;
};

export type StateTransition<T extends number> = ConditionWithParams & {
    target: T | NavigationStates;
    priority?: number;
};

export type GlobalScenario<TState extends number> = Partial<
    Record<TState, StateItem<TState>>
> & {
    startState: TState;
};

export namespace GlobalScenario {
    export function getAllStates<T extends number>(
        scenario: GlobalScenario<T>,
    ) {
        return Object.keys(scenario).map((k) => {
            const state = (k as unknown) as T;
            return {
                state,
                ...scenario[state],
            };
        });
    }
}
