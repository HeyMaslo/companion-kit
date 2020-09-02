import { AssessmentType, IntakeForms } from './intakeForms';
import Identify from './Identify';

export type ClientAssessmentState = {
    active: boolean,
    lastPush?: number,
    lastSent?: number,
};

export type ClientAssessments = { [K in AssessmentType]?: true | ClientAssessmentState };

export namespace ClientAssessments {
    export function getDateProperty(source: ClientAssessments, type: AssessmentType, prop: 'lastPush' | 'lastSent'): number | null {
        const t = source?.[type];
        if (t === true) {
            return 0;
        }
        return t?.[prop] || 0;
    }

    export function getIsActivated(source: ClientAssessments, type: AssessmentType) {
        const t = source?.[type];
        if (typeof t === 'boolean') {
            return t;
        }
        return t?.active;
    }

    export function getIsCooledDown(source: ClientAssessments, type: AssessmentType, targetDateMs: number): boolean {
        if (!getIsActivated(source, type)) {
            return null;
        }

        const lastPush = getDateProperty(source, type, 'lastPush');
        if (!lastPush) {
            return true;
        }

        const period = IntakeForms[type].RecurrencyTimeMs;
        return targetDateMs - lastPush > period;
    }
}

export interface ClientIntakeForm {
    date?: number;
    formType: AssessmentType,
    answers: number[],

    // for better locating it
    clientUid?: string;
    coachUid?: string;
    clientCardId?: string;
}

export type ClientIntakeFormIded = Identify<ClientIntakeForm>;
