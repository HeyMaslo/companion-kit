import { AssessmentTypeData } from './types';

const Answers = [
    {
        text: 'Yes',
        score: 1,
    },
    {
        text: 'No',
        score: 0,
    },
];

const Questions = [
    {
        text: 'Are you sleeping in an unsafe place?',
        answers: Answers,
    },
    {
        text: 'Are you unable to stay 6\' away from others at all times?',
        answers: Answers,
    },
    {
        text: 'Are you out (or almost out) of food?',
        answers: Answers,
    },
    {
        text: 'Are you out (or almost out) of important medications?',
        answers: Answers,
    },
    {
        text: 'Do you have a cough, fever, and/or trouble breathing?',
        answers: Answers,
    },
    {
        text: 'Are you very worried about any unusual symptoms or situation?',
        answers: Answers,
    },
    {
        text: 'Do you have thoughts of harming yourself or someone else?',
        answers: Answers,
    },
    {
        text: 'Do you need to talk to a Care Manager right now about a concern or problem?',
        answers: Answers,
    },
];

export const Homeless: AssessmentTypeData = {
    ScoreMin: 0,
    ScoreMax: 8,
    QuestionList: Questions,
    OnboardMessage: {
        title: 'We are here to help',
        text: 'Please answer the following questions to the best of your ability.',
    },
    RecurrencyTimeMs: Number.POSITIVE_INFINITY,

    normalize(s: number): number {
        return (s - Homeless.ScoreMin) / (Homeless.ScoreMax - Homeless.ScoreMin);
    },

    getTitle(s: number) {
        return Homeless.scoreToRecommendation(s).title;
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
        if (score === 0) {
            return {
                action: 'No action recommended',
                title: 'No need identified',
            };
        }

        return {
            action: 'Please reach out to the client',
            title: 'Need identified',
        };
    },
};

export default Homeless;
