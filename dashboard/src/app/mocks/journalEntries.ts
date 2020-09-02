import { ClientJournalEntryIded } from 'common/models/ClientEntries';
import Moods from 'common/models/Moods';
import Locations from 'common/models/Locations';
import transcriptionText from './transcriptionText';

const entries: ClientJournalEntryIded[] = [
    {
        id: '1',
        date: new Date().getTime(),
        question: 'What are you greatful for today',
        mood: Moods.Rough,
        location: Locations.AtWork,
        audioMeta: null,
        auidioRef: 'https://www.mfiles.co.uk/mp3-downloads/grieg-holberg-suite-3-gavotte.mp3',
        transcription: transcriptionText,
        image: null,
        private: false,
    },
    {
        id: '2',
        date: new Date().getTime(),
        question: 'If you paint a picture of any scenery you\'ve seen before, what would you paint?',
        mood: Moods.Difficult,
        location: Locations.InThePark,
        audioMeta: null,
        auidioRef: 'https://www.mfiles.co.uk/mp3-downloads/franz-schubert-standchen-serenade.mp3',
        transcription: transcriptionText,
        image: null,
        private: true,
    },
    {
        id: '3',
        date: new Date().getTime(),
        question: 'Do you have meaningful connections?',
        mood: Moods.Mixed,
        location: Locations.OnAWalk,
        audioMeta: null,
        auidioRef: 'https://www.mfiles.co.uk/mp3-downloads/beethoven-symphony6-1.mp3',
        transcription: transcriptionText,
        image: null,
        private: false,
    },
    {
        id: '4',
        date: new Date().getTime(),
        question: 'What is going good this week?',
        mood: Moods.Positive,
        location: Locations.Somewhere,
        audioMeta: null,
        auidioRef: 'https://www.mfiles.co.uk/mp3-downloads/bach-bourree-in-e-minor-piano.mp3',
        transcription: transcriptionText,
        image: null,
        private: true,
    },
];

export default entries;