import {
    ClientJournalEntryIded,
    IntelligentInsight,
    RecordData,
    SentimentAnalysis,
} from 'common/models';
import { Entity } from 'common/models/EntityReference';
import { createLogger } from 'common/logger';
import { isReplace, isStopWord } from 'common/utils/stopwords';
import { capitalizeFirstLetter, titleCase } from 'common/utils/stringFormatting';
import {
    getFrequentlyLocation,
    sentimentToEffect,
    storeEntityObjects,
    getGenderCode,
    getGenderWordsMatch,
    getJournalFrequency,
    getRandomPopular,
    getUniqueWordsData,
    JournalingAverage,
} from 'common/helpers/insights';
import LocationStrings from 'common/localization/LocationStrings';

const logger = createLogger('[IntelligentInsights]');

const ActiveInsights = {
    person: true,
    object: true,
    uniqueWords: true,
    randomPopular: true,
    journaling: true,
    gender: false,
    location: false,
};

export type GenerateOptions = {
    clientName: string,
    timePeriod: string,
    count?: number;
    journals?: readonly ClientJournalEntryIded[],
};

export type CollectedDataObjects = {
    [value: string]: {
        count: number,
        sentiment: number,
    },
};

export type CollectedData = {
    frequentEntitiesTypes: {[value: string]: number},
    frequentEntities: {[value: string]: number},
    persons: {[value: string]: number},
    objects: CollectedDataObjects,
    allWords: Array<string>,
    totalWords: number,
    totalSentences: number,
    totalSyllables: number,
    maleCodeWords: number,
    femaleCodeWords: number,
    frequentObject: {
        name: string,
        effect: string,
    },
    frequentPerson: string,
};

export type InsightsData = {
    journaling?: JournalingAverage,
    location?: string,
    person: string,
    object: {
        name: string,
        effect: string,
    },
    uniqueWords: {
        words: number,
        entities: string,
    },
    // grade: string,
    randomPopular: string,
    gender: string,
};

export type Insights = {
    client: string,
    count: number,
    data: InsightsData,
};

export type InsightBuilderFunction = (opts: Insights) => string;

const StatementsNew: { [value: string]: InsightBuilderFunction} = {
    location: o => `*${o.client}* most frequently journals made *${o.data.location}*`,
    person: o => `*${o.data.person}* has an effect on *${o.client}*`,
    object: o => `*${o.data.object.name}* seems to have a *${o.data.object.effect}* effect on *${o.client}*`,
    uniqueWords: o => `*${o.client}* has used *${o.data.uniqueWords.words}* unique words and talks about *${o.data.uniqueWords.entities}*.`,
    // grade: o => `*${o.client}* journals at a *${o.data.grade}* level`,
    journaling: o => {
        const lessMore = o.data.journaling.currentAverage > o.data.journaling.previousAverage ? 'MORE' : 'LESS';
        return `*${o.client}* is journaling ${lessMore} than their normal ${o.data.journaling.previousAverage} check-ins per day average.`;
    },
    randomPopular: o => `You should ask *${o.client}* more about *${o.data.randomPopular}*. It’s not quite clear how they feel about it.`,
    gender: o => `*${o.client}* tends to use *${o.data.gender}* coded language.`,
};

const PackCount = 4;

const EmptyArr: any[] = [];

function isEntityValid(entity: Entity) {
    if (isStopWord(entity.name) || isReplace(entity.name)) {
        return false;
    }

    const s = SentimentAnalysis.getValue(entity.sentiment);
    return Math.abs(s.score * s.magnitude) > 0.05;
}

function formatInsightsData(collectedData: CollectedData, env: GenerateOptions) {
    const {
        frequentObject,
        allWords,
        frequentEntities,
        femaleCodeWords,
        maleCodeWords,
        frequentEntitiesTypes,
        frequentPerson,
        // totalSentences,
        // totalSyllables,
        // totalWords,
    } = collectedData;
    const insightsData: Insights = {
        client: titleCase(env.clientName),
        count: env.count || PackCount,
        data: {
            person: titleCase(frequentPerson),
            object: frequentObject,
            uniqueWords: getUniqueWordsData(allWords, frequentEntitiesTypes),
            // grade: calculateKincaidGradeLevel(totalSentences, totalWords, totalSyllables),
            randomPopular: getRandomPopular(frequentEntities),
            gender: getGenderCode(maleCodeWords, femaleCodeWords),
        },
    };

    if (env.journals) {
        const lastLocation = getFrequentlyLocation(env.journals);
        const journalFrequency = getJournalFrequency(env.journals);

        insightsData.data.location = lastLocation && LocationStrings[lastLocation].toLowerCase();
        insightsData.data.journaling = journalFrequency;
    }

    return insightsData;
}

function createInsights(insightData: Insights): IntelligentInsight[] {
    const filtered = Object.keys(insightData.data)
        .filter((key: keyof InsightsData) => !!insightData.data[key] && ActiveInsights[key]);

    if (filtered.length <= insightData.count) {
        return filtered.map(key => {
            const phrase = StatementsNew[key](insightData);

            return {
                result: capitalizeFirstLetter(phrase),
                templateId: key,
            };
        });
    }

    const insightStrings: Array<IntelligentInsight> = [];

    for (let i = 0; i < insightData.count; i++) {
        const random = Math.floor(Math.random() * (filtered.length - 1));
        const key = filtered[random];
        const phrase = StatementsNew[key](insightData);

        insightStrings.push({
            result: capitalizeFirstLetter(phrase),
            templateId: key,
        });
        filtered.splice(random, 1);
    }

    return insightStrings;
}

export function generate(env: GenerateOptions, records: ReadonlyArray<RecordData>): IntelligentInsight[] {
    if (records.length <= 0) {
        logger.log('no records');
        return EmptyArr;
    }

    const collectedData: CollectedData = {
        frequentEntitiesTypes: {},
        frequentEntities: {},
        persons: {},
        objects: {},
        allWords: [],
        totalWords: 0,
        totalSentences: 0,
        totalSyllables: 0,
        maleCodeWords: 0,
        femaleCodeWords: 0,
        frequentObject: null,
        frequentPerson: null,
    };

    // collect and sort all entities
    const sortedRecords = records.slice().sort((r1, r2) => r2.date - r1.date);
    sortedRecords.forEach(record => {
        record.sentiment?.sentences?.forEach(s => {
            const words = s.text.content.replace(/[-!$%^&*()_+|~=`{}[]:";'<>?,.\/]/g, '').split(' ');
            const genderWords = getGenderWordsMatch(s.text.content);

            collectedData.maleCodeWords += genderWords.male;
            collectedData.femaleCodeWords += genderWords.female;
            // collectedData.totalSyllables += Vowels.getCount(s.text.content);
            // collectedData.totalSentences += 1;
            // collectedData.totalWords += words.length || 1;

            collectedData.allWords.push(...words);
        });

        record.entities?.forEach(e => {
            if (!isEntityValid(e)) {
                return;
            }

            const {frequentEntitiesTypes, frequentEntities, persons, objects} = collectedData;

            frequentEntitiesTypes[e.type] = frequentEntitiesTypes[e.type] ? frequentEntitiesTypes[e.type] + 1 : 1;

            frequentEntities[e.name] = frequentEntities[e.name] ? frequentEntities[e.name] + 1 : 1;

            if (e.type === 'PERSON' && !collectedData.frequentPerson) {
                persons[e.name] = persons[e.name] ? persons[e.name] + 1 : 1;
                if (persons[e.name] >= 3) {
                    collectedData.frequentPerson = e.name;
                }
            }

            if ((e.type === 'WORK_OF_ART' || e.type === 'CONSUMER_GOOD') && !collectedData.frequentObject) {
                objects[e.name] = storeEntityObjects(objects, e);
                if (objects[e.name]?.count >= 3) {
                    collectedData.frequentObject = {
                        name: e.name,
                        effect: sentimentToEffect(objects[e.name].sentiment),
                    };
                }
            }
        });
    });

    const insightsData = formatInsightsData(collectedData, env);

    return createInsights(insightsData);
}
