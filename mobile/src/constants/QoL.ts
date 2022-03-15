/*
    Types definitions for QoL (Quality of Life)
    survey data.
*/

import { Identify } from 'common/models';
import { DomainName } from './Domain';

// AFFIRMATIONS
export type Affirmation = {
    id: string,
    content: string,
    domainNames: DomainName[],
    mentionsBD: boolean,
};

// QUESTION

export type Question = {
    domainId: string, // reference to single domain
    text: string,
    position: number,
};

export type QuestionIded = Identify<Question>;

// SURVEY STATE DATA

export type QolSurveyResults = {
    [key in DomainName]: number[]
};

export namespace QolSurveyResults {
    export function createEmptyResults(): QolSurveyResults {
        return {
            Mood: [],
            Physical: [],
            Sleep: [],
            Thinking: [],
            Identity: [],
            Leisure: [],
            Independence: [],
            'Self-Esteem': [],
            Home: [],
            Money: [],
            Spirituality: [],
            Relationships: [],
        };
    }
}

export enum QolSurveyType {
    Full = 'FULL',
    Short = 'SHORT',
}

export type QoLSurveyTimestamp = number;

export type PartialQol = {
    questionNum: number,
    domainNum: number,
    scores: QolSurveyResults,
    startDate: QoLSurveyTimestamp,
    questionCompletionDates: QoLSurveyTimestamp[],
    surveyType: QolSurveyType,
};

// DAILY CHECK IN

export type DailyCheckInScore = {
    sleepScore: number,
    moodScore: number,
};

export type DailyCheckIn = DailyCheckInScore & {
    date: number,
};
