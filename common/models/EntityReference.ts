import { SentimentValue } from './Sentiment';

/** https://github.com/googleapis/googleapis/blob/master/google/cloud/language/v1/language_service.proto */
export enum EntityType {
    UNKNOWN = 'UNKNOWN',
    PERSON = 'PERSON',
    LOCATION = 'LOCATION',
    ORGANIZATION = 'ORGANIZATION',
    EVENT = 'EVENT',
    WORK_OF_ART = 'WORK_OF_ART',
    CONSUMER_GOOD = 'CONSUMER_GOOD',
    OTHER = 'OTHER',
    PHONE_NUMBER = 'PHONE_NUMBER',
    ADDRESS = 'ADDRESS',
    DATE = 'DATE',
    NUMBER = 'NUMBER',
    PRICE = 'PRICE',
}

export type Entity = {
    name: string;
    type: string;
    metadata: any;
    salience: number;
    mentions: {
        text: {
            content: string,
            beginOffset: number,
        },
        type: string,
        sentiment: SentimentValue,
    }[],
    sentiment: SentimentValue,
};

export namespace Entity {
    export function getMentionsCount(e: Entity) {
        return (e && e.mentions && e.mentions.length) ? e.mentions.length : 0;
    }
}
