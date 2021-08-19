import { spliceRandomMessage } from './notificationMessages';
import { Affirmation } from './QoL';

const testAffirmations: Affirmation[] = [
    {
        text: 'Affirmation 1, hello [name]',
        keywords: [],
        domains: ['domain1', 'domain3'],
        id: '1',
    },
    {
        text: 'Affirmation 2, goodbye [name]',
        keywords: [],
        domains: ['domain2', 'domain4'],
        id: '2',
    },
    {
        text: 'Affirmation 3',
        keywords: [],
        domains: ['domain4', 'domain5'],
        id: '3',
    },
    {
        text: 'Affirmation 4',
        keywords: [],
        domains: ['domain1', 'domain4'],
        id: '4',
    },
    {
        text: 'Affirmation 5',
        keywords: [],
        domains: ['domain2', 'domain5', 'domain6'],
        id: '5',
    },
];

export function getAffirmationForDomains(
    domains: string[] = [],
    countPerDomain: number,
    settings?: { [x: string]: string },
) {
    const res: Affirmation[] = [];
    const affirmationByDomain = {};

    for (const affirmation of testAffirmations) {
        for (let j = 0; j < affirmation.domains.length; j++) {
            let byDomain = affirmationByDomain[affirmation.domains[j]];

            if (!byDomain) {
                affirmationByDomain[affirmation.domains[j]] = [affirmation];
            } else {
                affirmationByDomain[affirmation.domains[j]].push(affirmation);
            }
        }
    }

    for (const domain of domains) {
        for (let i = 0; i < countPerDomain; i++) {
            const message = spliceRandomMessage(
                affirmationByDomain[domain],
                settings,
            ) as Affirmation;
            res.push(message);
        }
    }

    return res;
}
