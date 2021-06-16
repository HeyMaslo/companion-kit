
/*
    Types definitions for QoL (Quality of Life)
    survey data.
*/

import { Identify } from 'common/models';

// DOMAIN

export enum DomainScope {
    GENERAL = 'GENERAL',
    WORK = 'WORK',
    STUDENT = 'STUDENT',
}

export type Domain = {
    scope:      DomainScope,
    position:   number,
    name:       string,
    slug:       string,
    importance: string,     // description of why the domain is important
};

export type DomainIded = Identify<Domain>;

// STRATEGIES

export type Strategy = {
    title:                    string,
    details:                  string,
    associatedDomainNames:    string[],
};

export type StrategyIded = Identify<Strategy>;

export type DisplayStrategyIded = StrategyIded & {
    isChecked: boolean,
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
