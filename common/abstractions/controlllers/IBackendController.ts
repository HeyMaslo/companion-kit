export type DomainMagnitudesData = {
    [dom: string]: number
};

export type QolSurveyResults = {
    [dom: string]: number
};

export type PartialQol = {
    questionNum: number,
    domainNum: number,
    mags: DomainMagnitudesData,
    scores: QolSurveyResults
};

export interface IBackendController {

    getDomainMagnitudes(): Promise<DomainMagnitudesData>;

    setDomainMagnitudes(magnitudes: DomainMagnitudesData): Promise<boolean>;

    sendSurveyResults(results: QolSurveyResults): Promise<boolean>;

    sendPartialQol(domainMags: DomainMagnitudesData, surveyScores: QolSurveyResults,
        questionNumber: number, domainNumber: number): Promise<boolean>;

    getPartialQol(): Promise<PartialQol>;
}