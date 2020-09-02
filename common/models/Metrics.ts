import { EnumStringHelper } from 'common/utils/enumHelper';
import { arrayAverage, normalize } from 'common/utils/mathx';
import { RecordData, RecordDataIded } from 'common/models/RecordData';
import { SentimentAnalysis } from 'common/models/Sentiment';
import { ClientIntakeFormIded } from 'common/models/ClientAssessments';
import { PHQ9 } from 'common/models/intakeForms';
import Moods from 'common/models/Moods';
import { ClientJournalEntryIded } from 'common/models/ClientEntries';

export enum Metrics {
    Mindfulness = 'Mindfulness',
    MentalHealth = 'Wellness',
    Energy = 'Energy',
    Anxiety = 'Anxiety',
    Depression = 'Depression',
    Anger = 'Anger',
}

export namespace Metrics {

    const Helper = new EnumStringHelper<Metrics>(Metrics);

    export const All = Helper.Values;

    export function getMindfulness(items: ReadonlyArray<RecordDataIded>) {
        if (!items.length) {
            return null;
        }

        let mindfulness = 0;

        items.forEach(i => {
            mindfulness += i.mindfulness;
        });

        mindfulness /= items.length;

        return mindfulness;
    }

    export function getMentalHealth(items: ReadonlyArray<RecordDataIded>) {
        const minRecords = 7;
        let mentalHealth = 0;

        if (items.length >= minRecords) {
            const lastItems = items.slice(items.length - minRecords);
            const sentiments = lastItems.map(rs => SentimentAnalysis.getValue(rs.sentiment).score);
            mentalHealth = (arrayAverage(sentiments) + 1) / 2;
        } else {
            mentalHealth = null;
        }

        return mentalHealth;
    }

    export function getEnergy(items: ReadonlyArray<RecordDataIded>) {
        const minRecords = 7;
        let energy = 0;

        if (items.length >= minRecords) {
            const lastItems = items.slice(items.length - minRecords);
            const energyValues = lastItems.map(rs => RecordData.getEnergyValue(rs.energyLevel));
            energy = arrayAverage(normalize(energyValues));
        } else {
            energy = null;
        }

        return energy;
    }

    export function getAnxiety(items: ReadonlyArray<RecordDataIded>) {
        const minRecords = 3;
        let anxiety = 0;

        if (items.length >= minRecords) {
            let anxietyWordsCount = 0;
            const regex = new RegExp(`\\b(${anxietyWords.join('|')})\\b`, 'gmi');
            const sentiments = items.map(rs => {
                rs.sentiment?.sentences.forEach(sentence => {
                    const matches = sentence.text.content.match(regex);
                    anxietyWordsCount = matches ? anxietyWordsCount + matches.length : anxietyWordsCount;
                });

                return SentimentAnalysis.getValue(rs.sentiment).score;
            });

            anxiety = (-1 * arrayAverage(sentiments) + anxietyWordsCount * 0.2 + 1) / 2;
        } else {
            anxiety = null;
        }

        return anxiety;
    }

    export function getDepression(phq9: ReadonlyArray<ClientIntakeFormIded>, items: ReadonlyArray<ClientJournalEntryIded>) {
        if (!phq9 || !phq9.length) {
            return null;
        }

        let depression = 0;
        const phq9Scores = phq9.map(data => PHQ9.calculateScores(data.answers));
        // phq9 initial value, [PHQ9.Min..PHQ9.Max]
        depression = arrayAverage(phq9Scores);

        items?.forEach(rs => {
            const mood = Moods.findNearest(rs.mood);
            switch (mood) {
                case Moods.Rough:
                    depression += 2;
                    break;
                case Moods.Difficult:
                    depression += 1;
                    break;
                case Moods.Positive:
                    depression -= 1;
                    break;
                case Moods.VeryPositive:
                    depression -= 2;
                    break;
                default:
                    break;
            }
        });

        // normalize depression to 0-1
        return depression / (PHQ9.ScoreMax - PHQ9.ScoreMin);
    }

    export function getAnger(items: ReadonlyArray<RecordDataIded>) {
        const minRecords = 3;
        let anger = 0;

        if (items.length >= minRecords) {
            let angerWordsCount = 0;
            const regex = new RegExp(`\\b(${angerWords.join('|')})\\b`, 'gmi');
            const sentiments = items.map(rs => {
                rs.sentiment?.sentences.forEach(sentence => {
                    const matches = sentence.text.content.match(regex);
                    angerWordsCount = matches ? angerWordsCount + matches.length : angerWordsCount;
                });

                return SentimentAnalysis.getValue(rs.sentiment).score;
            });

            anger = (-1 * arrayAverage(sentiments) + angerWordsCount * 0.2 + 1) / 2;
        } else {
            anger = null;
        }

        return anger;
    }
}

const anxietyWords = [
    'Anxious', 'Anxiety', 'Stressed', 'Stress', 'Tired', 'angst', 'apprehension', 'concern', 'disquiet', 'doubt',
    'dread', 'jitters', 'misery', 'misgiving', 'mistrust', 'nervousness', 'panic', 'restlessness', 'suffering',
    'suspense', 'trouble', 'uncertainty', 'unease', 'uneasiness', 'botheration', 'creeps', 'disquietude', 'distress',
    'downer', 'fidgets', 'foreboding', 'fretfulness', 'fuss', 'heebie-jeebies', 'needles', 'shivers', 'solicitude',
    'sweat', 'watchfulness', 'willies', 'worriment', 'all-overs', 'ants in pants', 'sweat', 'nail-biting',
    'pins and needles', 'concern', 'worry', 'fear', 'angst', 'anxiolytic', 'troublesome', 'sweat', 'distress',
    'disquiet', 'solicitude', 'disquietude', 'security', 'anxious', 'worriment', 'secure', 'unconcern', 'suspense',
    'diazepam', 'concernment', 'trepidation', 'uneasiness', 'apprehend', 'panic', 'tense', 'trouble', 'over-anxiety',
    'careful', 'neurosis', 'apprehension', 'dysphoria', 'uneasy', 'collywobbles', 'tremble', 'hypochondria', 'gnaw',
    'careless', 'troubling', 'apprehensive', 'dread', 'lorazepam', 'fret', 'nightmare', 'haggard', 'worrisome', 'tyne',
    'delirium', 'tremens', 'consternate', 'careworn', 'pain', 'agonize', 'fraught', 'tension', 'nerve', 'nag', 'repose',
    'charge', 'fearful', 'nerves', 'gad', 'pucker', 'frantic', 'shock', 'on tenterhooks', 'with bated breath', 'stew',
    'inquietude', 'haunt', 'horror', 'uncomfortable', 'distressing', 'disquieting', 'tenterhook', 'disturbing', 'taut',
    'premenstrual', 'syndrome', 'agitation', 'anxiously', 'terror', 'insecurity', 'uneasily', 'strain', 'thioridazine',
    'cabin', 'fever', 'fright', 'freely', 'hypochondriac', 'haunted', 'nail-biting', 'separation', 'anxiety',
    'alprazolam', 'anti-anxiety', 'sweated', 'sweats', 'nonchalant', 'solace', 'afraid', 'compunction', 'heebie-jeebies',
    'nervous', 'unease', 'perplex', 'indifferent', 'ataractic', 'attack', 'turmoil', 'bugbear', 'distracted',
    'frantically', 'somatization', 'earnestness', 'free-floating', 'neurotic', 'anxieties', 'respire', 'consternation',
    'distrait', 'post-traumatic', 'stress', 'disorder', 'scare', 'wretched', 'creepy', 'queasy',  'oppressive', 'jitter',
    'stressful', 'biter', 'nail–biter',
];

const angerWords = [
    'Furious', 'angry', 'irate', 'anger', 'seething', 'infuriated', 'incensed', 'steamed', 'murderous',
    'steaming', 'at the end of my rope', 'mad', 'livid', 'wrathful', 'pissed off', 'fuck', 'fucking', 'shit',
];

export default Metrics;
