import Identify from '../Identify';
import { ClientTipsData, InterventionTip } from './interventionTips';
import { GoalType, ClientGoalState } from './goals';

export type PromptType = {
    id: string,
    categoryId: number,
    text: string,
    default?: boolean,
};

export type PromptsLibrary = {
    /** Custom prompts types */
    types: PromptType[],
    /** Intervention tips types */
    tips: InterventionTip[],
    /** Goals types */
    goals: GoalType[],
};

export type PromptsLibraryIded = Identify<PromptsLibrary>;

export type PromptReference = {
    promptId: string,
};

export type ClientPromptState = {
    promptId: string,
    /** whether this prompt is active so client can see it */
    active: boolean,
};

export type ClientLibraryState = {
    /** @deprecated */
    // active?: PromptReference[],

    prompts?: ClientPromptState[],
    tipsData?: ClientTipsData[],
    goals?: ClientGoalState[],

    /** client-specific library */
    library?: PromptsLibrary,
};

export namespace ClientLibraryState {

    export function migrate(this: void, state: ClientLibraryState, clear = false) {
        const oldState = state as { active: PromptReference[] };
        const active = oldState?.active;
        if (active) {
            if (!state.prompts) {
                state.prompts = [];
            }

            active.forEach(a => {
                const i = state.prompts.findIndex(pp => pp.promptId === a.promptId);
                if (i >= 0) {
                    state.prompts[i].active = true;
                } else {
                    state.prompts.push({
                        promptId: a.promptId,
                        active: true,
                    });
                }
            });

            if (clear) {
                oldState.active = null;
            }

            return true;
        }

        return false;
    }

    export function tryClear(this: void, state: ClientLibraryState, diff: Partial<ClientLibraryState>) {
        if ((state as { active: PromptReference[] })?.active) {
            (diff as any).active = null;
        }
        return diff;
    }
}

export type ClientLibraryStateIded = Identify<ClientLibraryState>;
