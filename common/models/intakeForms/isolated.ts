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
        text: 'Are you very worried about any unusual symptom or situation?',
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

export const Isolated: AssessmentTypeData = {
    ScoreMin: 0,
    ScoreMax: 6,
    QuestionList: Questions,
    OnboardMessage: {
        title: 'We are here to help',
        text: 'Community Connections is here to help you stay well during the Covid-19 Emergency. By answering the following questions we will be able to better assist you during this difficult situation.',
    },
    RecurrencyTimeMs: Number.POSITIVE_INFINITY,

    normalize(s: number): number {
        return (s - Isolated.ScoreMin) / (Isolated.ScoreMax - Isolated.ScoreMin);
    },

    getTitle(s: number) {
        return Isolated.scoreToRecommendation(s).title;
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

export default Isolated;
