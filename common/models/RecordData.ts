import { Entity } from './EntityReference';
import Identify from './Identify';
import { SpeechRecognition } from './SpeechRecognition';
import { SentimentAnalysis } from './Sentiment';
import { AudioMetadata, ImageMetadata } from './FileMeta';
import { VisionRecognition } from './VisionRecognition';

export { SpeechRecognition };

export type EnergyValue = {
    original: number,
    normalized?: number,
};

export enum RecordAnalyzeState {
    Initialized = 'inited',
    Prepared = 'prepared',
    TranscriptionStarted = 'transcriptionStarted',
    Transcribed = 'transcribed',
    Analyzed = 'analyzed',
    TriggersChecked = 'triggersChecked',
    UpdateJournalTrigger = 'updateJournalTrigger',
    Finished = UpdateJournalTrigger,
    Error = 'error',
}

export type TriggeredPhraseLogInfo = {
    phrase: string;
    notification: string;

    text?: string;
    phoneNumberSentTo?: string;
};

export interface RecordBaseData {
    // SERVICE DATA
    type: string;
    state: RecordAnalyzeState;

    clientUid: string;
    coachUid: string;
    clientCardId: string;

    /** Target record id (journal or session) */
    entryId: string;

    // MAIN DATA

    date: number;

    entities: Entity[];

    sentiment: SentimentAnalysis;

    /** @deprecated */
    readonly transcription?: string;
    transcriptionFull: SpeechRecognition.Result[];

    vision?: VisionRecognition;

    energyLevel: EnergyValue;
    mentalHealth: number;
    mindfulness: number;

    convertedAudioRef?: string;
    audioRms?: number;

    devsData?: {
        error?: string | {
            message?: string,
            errorJson?: string,
            failedOnState?: string,
        },
        audioMeta?: AudioMetadata,
        imageMeta?: ImageMetadata,
        longRunningOperationName?: string,
        mindfulCount?: number,
        vowelsCount?: number,
    };
}

export interface JournalRecordData extends RecordBaseData {
    type: 'journal';

    triggeredPhrase?: TriggeredPhraseLogInfo;
}

export interface SessionRecordData extends RecordBaseData {
    type: 'session';
}

export type RecordData = JournalRecordData | SessionRecordData;

export type RecordDataIded = Identify<RecordData>;
export type JournalRecordDataIded = Identify<JournalRecordData>;
export type SessionRecordDataIded = Identify<SessionRecordData>;

export namespace RecordData {
    export function getEnergyValue(energy: number | EnergyValue, original = true) {
        if (!energy) {
            return 0;
        }

        return typeof energy === 'number'
            ? energy
            : (original ? energy.original : energy.normalized);
    }
}
