import { CollectedDataObjects } from 'common/controllers/IntelligentInsights';
import { ClientJournalEntryIded, SentimentAnalysis } from 'common/models';
import { Entity, EntityType } from 'common/models/EntityReference';
import Locations from 'common/models/Locations';
import { Periods } from 'common/models/Periods';
import { splitItemsByPeriod } from 'common/helpers/metrics';
import { roundHalf, roundNumber } from 'common/utils/mathx';
import { startOf } from 'common/utils/dateHelpers';
import logger from 'common/logger';

export const maleWords = ['active', 'adventurous', 'aggress',
    'ambitio', 'analy', 'assert', 'athlet', 'autonom', 'battle',
    'boast', 'challeng', 'champion', 'compet', 'confident', 'courag',
    'decid', 'decision', 'decisive', 'defend', 'determin', 'domina',
    'dominant', 'driven', 'fearless', 'fight', 'force', 'greedy',
    'head-strong', 'headstrong', 'hierarch', 'hostil', 'implusive',
    'independen', 'individual', 'intellect', 'lead', 'logic',
    'objective', 'opinion', 'outspoken', 'persist', 'principle',
    'reckless', 'self-confiden', 'self-relian', 'self-sufficien',
    'selfconfiden', 'selfrelian', 'selfsufficien', 'stubborn',
    'superior', 'unreasonab'];

export const femaleWords = ['agree', 'affectionate', 'child',
    'cheer', 'collab', 'commit', 'communal', 'compassion', 'connect',
    'considerate', 'cooperat', 'co-operat', 'depend', 'emotiona',
    'empath', 'feel', 'flatterable', 'gentle', 'honest',
    'interpersonal', 'interdependen', 'interpersona',
    'inter-personal', 'inter-dependen', 'inter-persona', 'kind',
    'kinship', 'loyal', 'modesty', 'nag', 'nurtur', 'pleasant',
    'polite', 'quiet', 'respon', 'sensitiv', 'submissive', 'support',
    'sympath', 'tender', 'together', 'trust', 'understand', 'warm',
    'whin', 'enthusias', 'inclusive', 'yield', 'shar'];

export type JournalingAverage = {
    currentAverage: number,
    previousAverage: number,
};

export function storeEntityObjects(objects: CollectedDataObjects, entity: Entity) {
    const sentiment = SentimentAnalysis.getValue(entity.sentiment);

    if (!objects[entity.name]) {
        return {
            count: 1,
            sentiment: sentiment.score,
        };
    }

    return {
        count: objects[entity.name].count + 1,
        sentiment: objects[entity.name].sentiment + sentiment.score,
    };
}

export function getGenderWordsMatch(sentence: string): {male: number, female: number} {
    const femaleRegex = new RegExp(`\\b${femaleWords.join('|')}\\b`, 'gi');
    const maleRegex = new RegExp(`\\b${maleWords.join('|')}\\b`, 'gi');

    return {
        female: sentence.match(femaleRegex)?.length || 0,
        male: sentence.match(maleRegex)?.length || 0,
    };
}

export function getFrequentlyLocation(journals: readonly ClientJournalEntryIded[]): Locations {
    if (!journals.length) {
        return null;
    }

    const locations: Array<number> = [];
    let found: Locations = null;

    journals.forEach(e => {
        if (found) return;

        locations[e.location] = locations[e.location] ? locations[e.location] + 1 : 1;

        if (locations[e.location] >= 3 && e.location !== Locations.Somewhere) {
            found = e.location;
        }
    });

    return found;
}

export function getJournalFrequency(journals: ReadonlyArray<ClientJournalEntryIded>): JournalingAverage {
    if (!journals.length) {
        return null;
    }

    const now = Date.now();
    const weekAgo = startOf(now - Periods.ThisWeek * 1000, 'day').getTime();
    const fiveWeeksAgo = startOf(now - Periods.ThisWeek * 5 * 1000, 'day').getTime();

    if (journals[journals.length - 1].date <= fiveWeeksAgo) {
        const a = splitItemsByPeriod(journals, weekAgo, now, fiveWeeksAgo, weekAgo);

        return {
            currentAverage: roundNumber(a.current.length / 7),
            previousAverage: roundNumber(a.previous.length / 28),
        };
    }

    return null;
}

export function calculateKincaidGradeLevel(sentences: number, words: number, syllables: number) {
    const gradeValue = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
    return getGradeString(gradeValue);
}

export function getGenderCode(male: number, female: number) {
    const diff = male - female;
    const maleWord = diff > 0 ? 'male' : 'female';

    if (Math.abs(diff) > 3) {
        return `highly ${maleWord}`;
    } else if (Math.abs(diff) > 0) {
        return `moderately ${maleWord}`;
    }

    return 'gender neutral';
}

export function getUniqueWordsData(allWords: string[], frequentEntitiesTypes: {[value: string]: number}): {words: number, entities: string} {
    const filteredEntities: {[key in EntityType]?: number} = {};
    const availableEntities: {[key in EntityType]?: boolean} = {
        [EntityType.CONSUMER_GOOD]: true,
        [EntityType.WORK_OF_ART]: true,
        [EntityType.PERSON]: true,
        [EntityType.LOCATION]: true,
        [EntityType.ORGANIZATION]: true,
        [EntityType.EVENT]: true,
    };
    let counter = 0;

   Object.keys(frequentEntitiesTypes).forEach((type: EntityType) => {
       if (availableEntities[type]) {
           filteredEntities[type] = frequentEntitiesTypes[type];
           counter++;
       }
   });

    if (!allWords.length || counter < 2) {
        return null;
    }

    return {
        words: Array.from(new Set(allWords)).length,
        entities: getMostPopularEntity(filteredEntities),
    };
}

export function getMostPopularEntity(entities: {[value: string]: number}) {
    return Object.keys(entities).sort((a, b) => {
        return entities[b] - entities[a];
    }).splice(0, 2).map(key => getReadableEntityType(key)).join(' and ');
}

export function getRandomPopular(entities: {[value: string]: number}) {
    const populars = Object.keys(entities).filter(key => {
        return entities[key] >= 4;
    });
    const i = Math.floor(Math.random() * (populars.length - 1));

    return populars[i];
}

export function sentimentToEffect(sentiment: number) {
    if (sentiment > 0) {
        return 'positive';
    } else if (sentiment < 0) {
        return 'negative';
    }

    return 'neutral';
}

export const getGradeString = (value: number): string => {
    const grade = value > 12 ? 12 : roundHalf(value);
    let result = '';

    switch (roundHalf(grade)) {
        case 0.5:
            result = 'Kindergarten to First Grade';
            break;
        case 1:
            result = 'First Grade';
            break;
        case 1.5:
            result = 'First Grade to Second Grade';
            break;
        case 2:
            result = 'Second Grade';
            break;
        case 2.5:
            result = 'Second Grade to Third Grade';
            break;
        case 3:
            result = 'Third Grade';
            break;
        case 3.5:
            result = 'Third Grade to Fourth Grade';
            break;
        case 4:
            result = 'Fourth Grade';
            break;
        case 4.5:
            result = 'Fourth Grade to Fifth Grade';
            break;
        case 5:
            result = 'Fifth Grade';
            break;
        case 5.5:
            result = 'Fifth Grade to Sixth Grade';
            break;
        case 6:
            result = 'Sixth Grade';
            break;
        case 6.5:
            result = 'Sixth Grade to Seventh Grade';
            break;
        case 7:
            result = 'Seventh Grade';
            break;
        case 7.5:
            result = 'Seventh Grade to Eighth Grade';
            break;
        case 8:
            result = 'Eighth Grade';
            break;
        case 8.5:
            result = 'Eighth Grade to Ninth Grade';
            break;
        case 9:
            result = 'Ninth Grade';
            break;
        case 9.5:
            result = 'Ninth Grade to Tenth Grade';
            break;
        case 10:
            result = 'Tenth Grade';
            break;
        case 10.5:
            result = 'Tenth Grade to Eleventh Grade';
            break;
        case 11:
            result = 'Eleventh Grade';
            break;
        case 11.5:
            result = 'Eleventh Grade to Twelfth Grade';
            break;
        case 12:
            result = 'College Level and Above';
            break;
        default:
            result = 'unknown';
            break;
    }

    return result;
};

export const getReadableEntityType = (type: string): string => {
    let result = '';

    switch (type) {
        case EntityType.PERSON:
            result = 'persons';
            break;
        case EntityType.LOCATION:
            result = 'locations';
            break;
        case EntityType.ORGANIZATION:
            result = 'organizations';
            break;
        case EntityType.EVENT:
            result = 'events';
            break;
        case EntityType.WORK_OF_ART:
            result = 'works of art';
            break;
        case EntityType.CONSUMER_GOOD:
            result = 'consumer goods';
            break;
        default:
            result = 'different things';
            break;
    }

    return result;
};
