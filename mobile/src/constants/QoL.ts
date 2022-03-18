/*
    Types definitions for QoL (Quality of Life)
    survey data.
*/

import { Identify } from 'common/models';
import { DomainSlug } from './Domain';

// AFFIRMATIONS
export type Affirmation = {
    id: string,
    domains: DomainSlug[],
    content: string,
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
    Mood: number[],
    Physical: number[],
    Sleep: number[],
    Thinking: number[],
    Identity: number[],
    Leisure: number[],
    Independence: number[],
    SelfEsteem: number[],
    Home: number[],
    Money: number[],
    Spirituality: number[],
    Relationships: number[],
    Work?: number[],
    Study?: number[],
};

// Used for indexing QolSurveyResults and PersonaArmState
export enum QolSurveyKeys { Mood = '', Physical = '', Sleep = '', Thinking = '', Identity = '', Leisure = '', Independence = '', SelfEsteem = '', Home = '', Money = '', Spirituality = '', Relationships = '', Work = '', Study = '' };
export namespace QolSurveyResultsHelper {
    export function createEmptyResults(work: boolean = false, study: boolean = false): QolSurveyResults {
        const base = {
            Mood: [],
            Physical: [],
            Sleep: [],
            Thinking: [],
            Identity: [],
            Leisure: [],
            Independence: [],
            SelfEsteem: [],
            Home: [],
            Money: [],
            Spirituality: [],
            Relationships: [],
            Work: null,
            Study: null,
        };
        if (work) {
            base.Work = [];
        } else if (study) {
            base.Study = [];
        }
        return base;
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
