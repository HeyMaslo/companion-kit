import { StaticTipTypes } from 'common/models/StaticTips';
import { InterventionTipsStatuses } from 'common/models';

export type TipTypes = 'finish-qol' | 'monthly-qol' | 'check-in' | 'assessment' | 'staticTip' | 'interventionTip' | 'docLinkTip';

export interface ITipItemBase {
    id: string,
    type: TipTypes,
    title: string,
}

export interface IFinishQolTipItem extends ITipItemBase {
    type: 'finish-qol',
}

export interface IMonthlyQolTipItem extends ITipItemBase {
    type: 'monthly-qol',
}

export interface IStaticTipItem extends ITipItemBase {
    type: 'staticTip',

    url: string,
    staticTipType: StaticTipTypes,
}

export interface ICheckInTipItem extends ITipItemBase {
    type: 'check-in',
}

export interface IAssessmentTipItem extends ITipItemBase {
    type: 'assessment',
}

export interface IInterventionTipItem extends ITipItemBase {
    type: 'interventionTip',
    status: InterventionTipsStatuses.StatusIds,
    actions: {
        wontDo: () => Promise<void>,
        didntDo: () => Promise<void>,
        willDo: () => Promise<void>,
        done: () => Promise<void>,
        seen: () => Promise<void>,
    }
}

export interface IDocumentLinkTip extends ITipItemBase {
    type: 'docLinkTip',
    url: string,
    open: () => Promise<void>,
}

export type ITipItem = IStaticTipItem | ICheckInTipItem | IFinishQolTipItem | IMonthlyQolTipItem | IAssessmentTipItem | IInterventionTipItem | IDocumentLinkTip;
