import Identify from './Identify';

export type StaticTipTypes = 'article' | 'podcast' | 'video';

export type StaticTipItem = {
    type: StaticTipTypes,

    url: string,
    title: string,

    disabled?: boolean,
    date?: number,
};

export type StaticTipItemIded = Identify<StaticTipItem>;
