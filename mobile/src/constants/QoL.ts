/*
    Types definitions for QoL (Quality of Life)
    survey data.
*/

import { Identify } from 'common/models';

// AFFIRMATIONS
export type Affirmation = {
    id: string,
    keywords: string[],
    domains: string[],
    content: string,
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
    [dom: string]: number,
};

export enum QolSurveyType {
    Full = 'FULL',
}

export type QoLSurveyTimestamp = number;

export type PartialQol = {
    questionNum: number,
    domainNum: number,
    scores: QolSurveyResults,
    isFirstTimeQol: boolean,
    startDate: QoLSurveyTimestamp,
    questionCompletionDates: QoLSurveyTimestamp[],
};
