import Identify from './Identify';

export type IntelligentInsight = {
    templateId: string,
    result: string,
};

export type IntelligentInsightFeedback = IntelligentInsight & {
    useful: boolean,
    date: number,
    coachId: string,
    clientId: string,
};

export type IntelligentInsightFeedbackIded = Identify<IntelligentInsightFeedback>;
