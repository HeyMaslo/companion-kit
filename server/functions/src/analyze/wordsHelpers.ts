
export namespace MindfulWords {

    const All = [
        'here',
        'now',
        'present',
        'today',
        'right now',
        'moment',
        'immediately',
    ];

    const regex = new RegExp(`\\b(${All.join('|')})\\b`, 'gmi');

    export function getScore(text: string) {
        const matches = text.match(regex);
        const count = matches && matches.length;
        const score = count
            ? matches.length * MindfulWordWeight
            : NoWordWeight;

        return { count, score };
    }

    export const MindfulWordWeight = 0.2;
    export const NoWordWeight = 0.1;
}

export namespace Vowels {
    const vowels = /[aeiou]/gmi;

    export function getCount(text: string) {
        if (!text) {
            return 0;
        }

        const matches = text.match(vowels);
        return matches ? matches.length : 0;
    }
}