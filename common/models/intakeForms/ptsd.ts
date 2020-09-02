import { AssessmentTypeData } from './types';

const Answers = [
    {
        text: 'None',
        score: 0,
    },
    {
        text: 'Little',
        score: 1,
    },
    {
        text: 'Some',
        score: 2,
    },
    {
        text: 'Much',
        score: 3,
    },
    {
        text: 'Most',
        score: 4,
    },
];

const Questions = [
    {
        text: 'I try to stay away from people, places, or things that remind me about what happened',
        answers: Answers,
    },
    {
        text: 'I get upset easily or get into arguments or physical flights',
        answers: Answers,
    },
    {
        text: 'I have trouble concentrating or paying attention',
        answers: Answers,
    },
    {
        text: 'When something reminds me of what happened I get very upset, afraid, or sad',
        answers: Answers,
    },
    {
        text: 'I have trouble feeling happiness or love',
        answers: Answers,
    },
    {
        text: 'I try not to think about or have feelings about what happened',
        answers: Answers,
    },
    {
        text: 'When something reminds me of what happened, I have strong feelings in my body like my heart beats fast, my head aches or my stomach aches',
        answers: Answers,
    },
    {
        text: 'I have thoughts like “I will never be able to trust other people”',
        answers: Answers,
    },
    {
        text: 'I feel alone even when I am around other people',
        answers: Answers,
    },
    {
        text: 'I have upsetting thoughts, pictures or sounds of what happened come into my mind when I don’t want them to',
        answers: Answers,
    },
    {
        text: 'I have trouble going to sleep, wake up often, or have trouble getting back to sleep',
        answers: Answers,
    },
];

export const PTSD: AssessmentTypeData = {
    ScoreMin: 0,
    ScoreMax: 44,
    QuestionList: Questions,
    OnboardMessage: {
        title: 'Try to remember',
        text: 'How much of the time during the past month...',
    },
    RecurrencyTimeMs: Number.POSITIVE_INFINITY,

    normalize(s: number): number {
        return (s - PTSD.ScoreMin) / (PTSD.ScoreMax - PTSD.ScoreMin);
    },

    getTitle(s: number) {
        return PTSD.scoreToRecommendation(s).title;
    },

    calculateScores(answers: number[]) {
        let scores = 0;

        answers.forEach((answerIndex, i) => {
            scores += Questions[i].answers[answerIndex].score;
        });

        return scores;
    },

    answersBlock(answers: number[]) {
        return answers.map((answerIndex, i) => {
            return {
                question: Questions[i].text,
                answer: Questions[i].answers[answerIndex].text,
            };
        });
    },

    scoreToRecommendation(score: number) {
        if (score <= 10) {
            return {
                action: 'No action recommended',
                title: 'Minimal PTSD symptoms',
            };
        }
        if (10 < score && score <= 15) {
            return {
                action: 'Watchful waiting, self-management, education, periodic rescreening',
                title: 'Mild PTSD symptoms',
            };
        }
        if (16 < score && score <= 20) {
            return {
                action: 'Consider further evaluation - suggest full PTSD-RI assessment',
                title: 'Moderate PTSD symptoms',
            };
        }
        if (20 < score) {
            return {
                action: 'Warrants full PTSD-RI assessment and referral to a trauma specialist',
                title: 'Potential PTSD',
            };
        }
    },
};

export default PTSD;
