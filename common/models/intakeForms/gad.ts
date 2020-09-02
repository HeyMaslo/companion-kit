import { AssessmentTypeData } from './types';

const Answers = [
    {
        text: 'Not at all',
        score: 0,
    },
    {
        text: 'Several days',
        score: 1,
    },
    {
        text: 'More than half the days',
        score: 2,
    },
    {
        text: 'Nearly every day',
        score: 3,
    },
];

const Questions = [
    {
        text: 'Feeling nervous, anxious, or on edge',
        answers: Answers,
    },
    {
        text: 'Not being able to stop or control worrying',
        answers: Answers,
    },
    {
        text: 'Worrying too much about different things',
        answers: Answers,
    },
    {
        text: 'Trouble relaxing',
        answers: Answers,
    },
    {
        text: 'Being so restless that it is hard to sit still',
        answers: Answers,
    },
    {
        text: 'Becoming easily annoyed or irritable',
        answers: Answers,
    },
    {
        text: 'Feeling afraid, as if something awful might happen',
        answers: Answers,
    },
];

export const GAD: AssessmentTypeData = {
    ScoreMin: 0,
    ScoreMax: 21,
    QuestionList: Questions,
    OnboardMessage: {
        title: 'Try to remember',
        text: 'Over the last two weeks, how often have you been bothered by the following problems?',
    },
    RecurrencyTimeMs: Number.POSITIVE_INFINITY,

    normalize(s: number): number {
        return (s - GAD.ScoreMin) / (GAD.ScoreMax - GAD.ScoreMin);
    },

    getTitle(s: number) {
        return GAD.scoreToRecommendation(s).title;
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
        if (score <= 4) {
            return {
                action: 'None',
                title: 'Minimal anxiety',
            };
        }
        if (4 < score && score <= 9) {
            return {
                action: 'Watchful waiting, repeat at follow up',
                title: 'Mild anxiety',
            };
        }
        if (9 < score && score <= 14) {
            return {
                action: 'Consider CBT and pharmacotherapy',
                title: 'Moderate anxiety',
            };
        }
        if (14 < score) {
            return {
                action: 'Initiation of pharmacotherapy and CBT. Consider specialist referral to psychiatrist.',
                title: 'Severe anxiety',
            };
        }
    },
};

export default GAD;
