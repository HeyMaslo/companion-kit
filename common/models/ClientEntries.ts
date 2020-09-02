import Identify from './Identify';
import Locations from './Locations';
import { AudioMetadata, ImageMetadata, FileReference } from './FileMeta';
import { TipsLabels } from 'common/models';

export interface ClientEntry {
    date?: number;

    audioMeta: AudioMetadata;
    auidioRef: string;

    transcription: string;
    image: FileReference<ImageMetadata>;

    // for better querying
    clientUid?: string;
    coachUid?: string;
    clientCardId?: string;
}

export interface ClientJournalEntry extends ClientEntry {
    question: string,
    mood: number, // Moods
    location: Locations,
    private: boolean,
    feelings?: TipsLabels[],
    meta?: { promptId?: string },
}

export interface ClientSessionEntry extends ClientEntry {
    name: string,
}

export type ClientEntryIded = Identify<ClientEntry>;
export type ClientJournalEntryIded = Identify<ClientJournalEntry>;
export type ClientSessionEntryIded = Identify<ClientSessionEntry>;
