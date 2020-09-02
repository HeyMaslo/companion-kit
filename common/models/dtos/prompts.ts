import { PromptType, GoalType, ClientGoalState, ClientPromptState } from 'common/models/prompts';
import { ClientTipsData, InterventionTip } from 'common/models';
import UserRoles from 'common/models/UserRoles';
import { BaseUpdateDto } from './updateDto';

export type BaseClientUpdateDto<T, TState> = BaseUpdateDto<T> & {
    clientId: string,
    states?: Record<string, Partial<TState>>,
};

export type BaseRequest<T, TState> = BaseUpdateDto<T> & {
    client?: BaseClientUpdateDto<T, TState>,
    callerRole?: UserRoles.Coach | UserRoles.Client,
    coachId?: string,
};

export type BaseResponse<T, TState> = {
    affected?: T[],
    clientAffected?: {
        types?: T[],
        states?: Record<string, TState>,
    },
};

export type Typed<T, Type> = T & {
    type: Type,
};

// LIBRARY

export type EnsureLibraryRequest = void;
export type EnsureLibraryRequestTyped = Typed<EnsureLibraryRequest, 'library'>;

// PROMPTS

export type PromptsRequest = BaseRequest<PromptType, ClientPromptState>;
export type ClientPromptsRequest = PromptsRequest['client'];
export type PromptsRequestTyped = Typed<PromptsRequest, 'prompts'>;
export type PromptsResponse = BaseResponse<PromptType, ClientPromptState>;

// TIPS

export type TipsRequest = BaseRequest<InterventionTip, ClientTipsData>;
export type ClientTipsRequest = TipsRequest['client'];
export type TipsRequestTyped = Typed<TipsRequest, 'tips'>;
export type TipsResponse = BaseResponse<InterventionTip, ClientTipsData>;

// GOALS

export type GoalsRequest = BaseRequest<GoalType, ClientGoalState>;
export type GoalsRequestTyped = Typed<GoalsRequest, 'goals'>;
export type GoalsResponse = BaseResponse<GoalType, ClientGoalState>;

// MAIN
export type RequestDto = PromptsRequestTyped
    | TipsRequestTyped
    | GoalsRequestTyped
    | EnsureLibraryRequestTyped;

export type ResponseDto = Typed<PromptsResponse, 'prompts'>
    | Typed<TipsResponse, 'tips'>
    | Typed<GoalsResponse, 'goals'>
    | Typed<{ ok: boolean }, 'library'>;

export namespace RequestDto {
    export function isPrompts(r: RequestDto): r is PromptsRequestTyped {
        const jed = r as PromptsRequestTyped;
        return !!jed?.type && jed.type === 'prompts';
    }

    export function isTips(r: RequestDto): r is TipsRequestTyped {
        const jed = r as TipsRequestTyped;
        return !!jed?.type && jed.type === 'tips';
    }

    export function isGoals(r: RequestDto): r is GoalsRequestTyped {
        const jed = r as GoalsRequestTyped;
        return !!jed?.type && jed.type === 'goals';
    }

    export function isEnsureLibrary(r: RequestDto): r is EnsureLibraryRequestTyped {
        const led = r as EnsureLibraryRequestTyped;
        return !!led?.type && led.type === 'library';
    }
}
