import Identify from 'common/models/Identify';
import { EntityWithStatus } from 'common/models/EntityWithStatus';
import { EnumStringHelper } from 'common/utils/enumHelper';
import { TipsLabels } from './TipsLabels';

export const TipStatusExpiration = 1000 * 3600 * 24 * 7 * 2; // two weeks

export enum InterventionTipsStyle {
    NoResponse = 'no_response',
    WontDo = 'wont_do',
    WillDo = 'will_do',
    DidntDo = 'didnt_do',
    Done = 'done',
}

export type TipStatus<T extends string> = {
    id: T,
    name: string,
    style: InterventionTipsStyle,
};

export namespace InterventionTipsStatuses {

    export enum StatusIds {
        NoResponse = 'no_response',
        WontDo = 'wont_do',
        WillDo = 'will_do',
        DidntDo = 'didnt_do',
        Done = 'done',
    }

    export namespace StatusIds {
        export const Helper = new EnumStringHelper<StatusIds>(StatusIds);
    }

    export const Statuses: TipStatus<StatusIds>[] = [
        { id: null, name: 'No response', style: InterventionTipsStyle.NoResponse },
        { id: StatusIds.NoResponse, name: 'Seen', style: InterventionTipsStyle.NoResponse },
        { id: StatusIds.WontDo, name: 'Won\'t do', style: InterventionTipsStyle.WontDo },
        { id: StatusIds.WillDo, name: 'Will do', style: InterventionTipsStyle.WillDo },
        { id: StatusIds.DidntDo, name: 'Didn\'t do', style: InterventionTipsStyle.DidntDo },
        { id: StatusIds.Done, name: 'Done', style: InterventionTipsStyle.Done },
    ];
}

export type InterventionTip = {
    id: string,
    text: string,
    labels: TipsLabels[],

    default?: boolean,
    date?: number,
};

export type InterventionTipWithStatus = InterventionTip & { status: InterventionTipsStatuses.StatusIds };

export type TipsLibrary = {
    tips: InterventionTip[],
};

export type TipsLibraryIded = Identify<TipsLibrary>;

export type ClientTipsData = EntityWithStatus<InterventionTipsStatuses.StatusIds> & {
    tipId: string;
    // active?: boolean;
};

export namespace ClientTipsData {
    export function changeStatus(tip: ClientTipsData, status: InterventionTipsStatuses.StatusIds, date: number = null) {
        return EntityWithStatus.changeStatus(tip, status, date);
    }

    export function getLastStatusDate(tip: ClientTipsData, ...statuses: InterventionTipsStatuses.StatusIds[]) {
        return EntityWithStatus.getLastStatusDate(tip, ...statuses);
    }
}

export type ClientTips = {
    tipsData: ClientTipsData[],
};

export type ClientTipsIded = Identify<ClientTips>;
