
/*
    Types definitions for QoL (Quality of Life)
    survey data.
*/

import { Identify } from 'common/models';

export enum DomainScope {
    GENERAL = 'GENERAL',
    WORK    = 'WORK',
    STUDENT = 'STUDENT',
}

export type Domain = {
    scope:      DomainScope,
    position:   number,
    name:       string,
    slug:       string,
};

export type DomainIded = Identify<Domain>;

export type Question = {
    domainId:   string, // reference to single domain
    text:       string,
    position:   number,
};

export type QuestionIded = Identify<Question>;

// SURVEY STATE DATA

export type QolSurveyResults = {
    [dom: string]: number,
};

export type PartialQol = {
    questionNum: number,
    domainNum: number,
    scores: QolSurveyResults,
    isFirstTimeQol: boolean,
};

export type SurveyState = {
    userId: string,
    state: PartialQol,
};
