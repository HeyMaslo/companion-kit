
export type Answer = {
    text: string;
    score: number;
    route?: number;
};

export type Answers = Answer[];

export type Question = {
    text: string;
    answers: Answers;
};

export type OnboardQuestion = {
    title: string;
    text: string;
    action?: string,
    rejectAction?: string,
};

export type IntermissionScreen = {
    stepIndex: number,
    title: string,
    text: string,
};

export type Recommendation = {
    title: string,
    action: string,
    secondaryAction?: string,
    primaryText?: string,
    secondaryText?: string,
    shortTitle?: string,
    riskLevel?: Recommendation.RiskLevels,
};

export namespace Recommendation {
    export const enum RiskLevels {
        Undefined = 1,
        Low = 2,
        Medium = 3,
        High = 4,
    }
}

export type AssessmentTypeData = {
    readonly ScoreMin?: number;
    readonly ScoreMax?: number;
    readonly ExpirationTimeMs?: number,

    readonly QuestionList: Question[],
    readonly WelcomeMessage?: OnboardQuestion,
    readonly OnboardMessage: OnboardQuestion,
    readonly RecurrencyTimeMs: number,
    readonly Intermissions?: IntermissionScreen[],
    readonly DynamicForm?: boolean,
    readonly AllowClientRetake?: boolean;

    normalize(score: number): number,
    getTitle(score: number): string,
    scoreToRecommendation(score: number): Recommendation,
    calculateScores(answers: number[]): number,
    answersBlock(answers: number[]): { question: string, answer: string }[],
};
