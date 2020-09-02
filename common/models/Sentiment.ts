
export type SentimentValue = {
    score: number,
    magnitude: number,
};

export type SentimentItem = SentimentValue & {
    date: number,
};

export type SentimentAnalysis = {
    documentSentiment: SentimentValue,
    language: string,
    sentences: {
        text: {
            content: string,
            beginOffset: number,
        },
        sentiment: SentimentValue,
    }[],
};

export namespace SentimentAnalysis {
    export function getValue(sentiment: number | SentimentValue | SentimentAnalysis): SentimentValue {
        if (sentiment == null) {
            return { score: 0, magnitude: 0 };
        }

        if (typeof sentiment === 'number') {
            return { score: sentiment, magnitude: 0 };
        }

        const val = sentiment as SentimentValue;
        if (val && val.score != null && val.magnitude != null) {
            return val;
        }

        const sa = sentiment as SentimentAnalysis;
        return sa.documentSentiment || { score: 0, magnitude: 0 };
    }

    export function sum(s1: SentimentValue, s2: SentimentValue): SentimentValue {
        return {
            score: s1.score + s2.score,
            magnitude: s1.magnitude + s2.magnitude,
        };
    }

    export function average(...s: SentimentValue[]): SentimentValue {
        const res: SentimentValue = { score: 0, magnitude: 0 };

        if (s.length <= 0) {
            return res;
        }

        s.forEach(ss => {
            res.score += ss?.score || 0;
            res.magnitude += ss?.magnitude || 0;
        });

        res.score /= s.length;
        res.magnitude /= s.length;
        return res;
    }

    export function extractValues(sentiment: number | SentimentAnalysis): SentimentItem[] {
        if (sentiment == null) {
            return [{ score: 0, magnitude: 0, date: 0 }];
        }

        if (typeof sentiment === 'number') {
            return [{ score: sentiment, magnitude: 0, date: 0 }];
        }

        const val = sentiment as unknown as SentimentValue;
        if (val.score != null && val.magnitude != null) {
            return [{
                ...val,
                date: 0,
            }];
        }

        if (!sentiment.sentences || sentiment.sentences.length <= 0) {
            const res = {
                ...(sentiment.documentSentiment || { score: 0, magnitude: 0 }),
                date: 0,
            };
            return [];
        }

        return sentiment.sentences.map(ss => ({
            ...ss.sentiment,
            date: ss.text.beginOffset,
        }));
    }

    export function normalizeFromMood(mood: number): number {
        const moodScale = mood - 10;
        if (moodScale <= 0) return -1;

        const sentimentScale = (200 * moodScale) / 40;

        return (sentimentScale / 100) - 1;
    }
}
