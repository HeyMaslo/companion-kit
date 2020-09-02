import { AssessmentTypeData } from './types';

const Answers = [
    {
        text: 'Never',
        score: 0,
    },
    {
        text: 'Sometimes',
        score: 1,
    },
    {
        text: 'Often',
        score: 2,
    },
    {
        text: 'Always',
        score: 3,
    },
];

const Questions = [
    {
        text: 'I feel sad or empty',
        answers: Answers,
    },
    {
        text: 'I worry when I think I have done poorly at something',
        answers: Answers,
    },
    {
        text: 'I would feel afraid of being on my own at home',
        answers: Answers,
    },
    {
        text: 'Nothing is much fun anymore',
        answers: Answers,
    },
    {
        text: 'I worry that something awful will happen to someone in my family',
        answers: Answers,
    },
    {
        text: 'I am afraid of being in crowded places (like shopping centers, the movies, buses, busy playgrounds)',
        answers: Answers,
    },
    {
        text: 'I worry what other people think of me',
        answers: Answers,
    },
    {
        text: 'I have trouble sleeping',
        answers: Answers,
    },
    {
        text: 'I feel scared if I have to sleep on my own',
        answers: Answers,
    },
    {
        text: 'I have problems with my appetite',
        answers: Answers,
    },
    {
        text: 'I suddenly become dizzy or faint when there is no reason for this',
        answers: Answers,
    },
    {
        text: 'I have to do some things over and over again (like washing my hands, cleaning or putting things in a certain order)',
        answers: Answers,
    },
    {
        text: 'I have no energy for things',
        answers: Answers,
    },
    {
        text: 'I suddenly start to tremble or shake when there is no reason for this',
        answers: Answers,
    },
    {
        text: 'I cannot think clearly',
        answers: Answers,
    },
    {
        text: 'I feel worthless',
        answers: Answers,
    },
    {
        text: 'I have to think of special thoughts (like numbers or words) to stop bad things from happening',
        answers: Answers,
    },
    {
        text: 'I think about death',
        answers: Answers,
    },
    {
        text: 'I feel like I don’t want to move',
        answers: Answers,
    },
    {
        text: 'I worry that I will suddenly get a scared feeling when there is nothing to be afraid of',
        answers: Answers,
    },
    {
        text: 'I am tired a lot',
        answers: Answers,
    },
    {
        text: 'I feel afraid that I will make a fool of myself in front of people',
        answers: Answers,
    },
    {
        text: 'I have to do some things in just the right way to stop bad things from happening',
        answers: Answers,
    },
    {
        text: 'I feel restless',
        answers: Answers,
    },
    {
        text: 'I worry that something bad will happen to me',
        answers: Answers,
    },
];

export const RCADS: AssessmentTypeData = {
    ScoreMin: 0,
    ScoreMax: 44,
    QuestionList: Questions,
    OnboardMessage: {
        title: 'Try to remember',
        text: 'Tell me how often each of these things happens to you. There are no right or wrong answers.',
    },
    RecurrencyTimeMs: Number.POSITIVE_INFINITY,

    Intermissions: [
        { stepIndex: 13, title: 'Woohoo!', text: 'You\'re halfway. It\'s going great' },
    ],

    normalize(s: number): number {
        return (s - RCADS.ScoreMin) / (RCADS.ScoreMax - RCADS.ScoreMin);
    },

    getTitle(s: number) {
        return RCADS.scoreToRecommendation(s).title;
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
        if (score <= 20) {
            return {
                action: 'No action needed',
                title: 'Moderate',
            };
        }

        return {
            action: 'Active treatment with pharmacotherapy and/or psychotherapy',
            title: 'Severe',
        };
    },
};

export default RCADS;
