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
        text: 'Little interest or pleasure in doing things',
        answers: Answers,
    },
    {
        text: 'Feeling down, depressed or hopeless',
        answers: Answers,
    },
    {
        text: 'Trouble falling or staying asleep, or sleeping too much',
        answers: Answers,
    },
    {
        text: 'Feeling tired or having little energy',
        answers: Answers,
    },
    {
        text: 'Poor appetite or overeating',
        answers: Answers,
    },
    {
        text: 'Feeling bad about yourself or that you are a failure of have let yourself or your family down',
        answers: Answers,
    },
    {
        text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
        answers: Answers,
    },
    {
        text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
        answers: Answers,
    },
    {
        text: 'Thoughts that you would be better off dead, or of hurting yourself',
        answers: Answers,
    },
];

export const PHQ9: AssessmentTypeData = {
    ScoreMin: 0,
    ScoreMax: 27,
    ExpirationTimeMs: 1000 * 3600 * 24 * 7, // 1 week

    QuestionList: Questions,
    OnboardMessage: {
        title: 'Try to remember',
        text: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
    },

    RecurrencyTimeMs: 1000 * 3600 * 24 * 7 * 2, // 2 weeks
    // get RecurrencyTimeMs() {
    //     // should be called dynamically for some edge cases
    //     return (!process.env.APP_ENV || process.env.APP_ENV === 'production')
    //         ? 1000 * 3600 * 24 * 7 * 2 // 2 weeks
    //         : 1000 * 60 * 5; // 5 minutes
    // },

    normalize(s: number): number {
        return (s - PHQ9.ScoreMin) / (PHQ9.ScoreMax - PHQ9.ScoreMin);
    },

    getTitle(s: number) {
        return PHQ9.scoreToRecommendation(s).title;
    },

    calculateScores(answers: number[]): number {
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
                action: 'No action recommended',
                title: 'None-minimal',
            };
        }
        if (4 < score && score <= 9) {
            return {
                action: 'Watchful waiting; repeat PHQ-9 at follow-up',
                title: 'Mild',
            };
        }
        if (9 < score && score <= 14) {
            return {
                action: 'Develop treatment plan considering counseling, follow-up and/or pharmacotherapy',
                title: 'Moderate',
            };
        }
        if (14 < score && score <= 19) {
            return {
                action: 'Active treatment with psychotherapy; consider pharmacotherapy',
                title: 'Moderately Severe',
            };
        }
        if (19 < score) {
            return {
                action: 'Immediate initiation of psychotherapy and pharmacotherapy',
                title: 'Severe',
            };
        }
    },
};

export default PHQ9;
