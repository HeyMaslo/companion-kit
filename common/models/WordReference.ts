import { Entity } from './EntityReference';
import { isStopWord, isReplace } from 'common/utils/stopwords';
import { SentimentValue, SentimentAnalysis } from './Sentiment';

export type WordReference = {
    value: string;
    count: number;

    sentiment: SentimentValue,

    categories?: Array<string>;
};

export namespace WordReference {
    export function fromEntities(entities: Entity[]): Array<WordReference> {

        const words: { [value: string]: { count: number; categories: Array<string>; sentiments: SentimentValue[] }} = {};
        entities.forEach(e => {
            let wordName = e.name.toLowerCase();
            if (isStopWord(wordName)) {
                return;
            }
            wordName = isReplace(wordName) || wordName;
            const word = words[wordName];
            const isCatExist = word && word.categories.indexOf(e.type) !== -1;
            const wordCategories = isCatExist ? word && word.categories : (word && word.categories || []).concat(e.type);

            const refCount = Entity.getMentionsCount(e);
            const wordCount = (word && word.count || 0) + refCount;
            const sentiments: SentimentValue[] = word?.sentiments || [];
            sentiments.push(e.sentiment);

            words[wordName] = {
                count: wordCount,
                categories: wordCategories,
                sentiments,
            };
        });

        return Object.keys(words).map(k => ({
            value: k,
            count: words[k].count,
            categories: words[k].categories,
            sentiment: SentimentAnalysis.average(...words[k].sentiments),
        }));
    }
}