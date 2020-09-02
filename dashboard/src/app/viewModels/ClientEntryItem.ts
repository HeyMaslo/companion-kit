import { observable, computed } from 'mobx';
import { asyncComputed } from 'computed-async-mobx';
import { formatTimespan } from 'common/utils/dateHelpers';
import {
    SessionRecordDataIded,
    ClientSessionEntryIded,
    RecordDataIded,
    ClientEntryIded,
    JournalRecordDataIded,
    ClientJournalEntryIded,
    WordReference,
    SentimentAnalysis,
    SpeechRecognition,
} from 'common/models';
import { StorageReferenceViewModel } from 'common/viewModels/StorageReferenceViewModel';
import * as Routes from 'app/constants/routes';
import Categories, { CATEGORIES } from 'app/constants/categories';
import history from 'app/services/history';
import { ClientModel } from 'app/controllers/ClientModel';
import * as ViewModels from 'common/viewModels';
import AudioItem from './AudioItem';
// import { DateFormats } from 'common/viewModels';
import * as ChartsData from 'common/viewModels/charts';
import logger from 'common/logger';
import Moods from 'common/models/Moods';
import { formatDate } from 'common/utils/dateHelpers';
import AppController from 'app/controllers';
import { downloadFile } from 'app/utils/downloadFile';

const EmptyArr: any[] = [];
export type EntryFileType = 'audio' | 'text' | 'image';

export abstract class ClientEntryItem<
    TEntry extends ClientEntryIded,
    TRecord extends RecordDataIded,
> extends AudioItem {

    @observable
    private _overrideRecord: TRecord = null;

    private readonly _recordFetcher = asyncComputed(null, 500, async () => {
        const jid = this.entry.id;
        const result = jid && await this.client.records.findRecord(jid);
        const record = result?.record;
        if (record?.convertedAudioRef) {
            this.audioPlayer.setRef(record.convertedAudioRef);
        }

        return record ? this.processRecord(record) : null;
    });

    @observable
    private _wordsFilter = new ViewModels.SelectString(Categories.AllCategories, 0);

    constructor(
        protected readonly entry: TEntry,
        private readonly _clientGetter: () => ClientModel,
    ) {
        super(entry);
    }

    protected get client() { return this._clientGetter(); }

    protected abstract processRecord(r: RecordDataIded): TRecord;

    protected abstract get transcriptionRoute(): string;
    protected abstract get innerRoute(): string;

    @computed
    private get record(): TRecord {
        const rec = this._overrideRecord || this._recordFetcher.get();
        return rec;
    }

    get loading() { return this._recordFetcher.busy; }

    get wordsFilter() { return this._wordsFilter; }

    get id() { return this.entry.id; }

    // get hasAudio() { return !!this.entry.auidioRef; }
    get fileType(): EntryFileType {
        if (this.entry.auidioRef) {
            return 'audio';
        }
        if (this.entry.image?.storageRef) {
            return 'image';
        }
        return 'text';
    }

    get clientFirstName() { return this.client && this.client.card && this.client.card.firstName; }

    @computed
    get transcription() {
        if (this.record) {
            if (this.record.transcriptionFull && this.record.transcriptionFull.length > 0) {
                const res = SpeechRecognition.merge(this.record.transcriptionFull);
                if (!res) {
                    logger.warn('no transcription', this.record);
                }
                return res;
            }

            if (this.record.transcription) {
                return this.record.transcription;
            }
        }

        return this.entry.transcription;
    }

    @computed
    get imageUrl() {
        return new StorageReferenceViewModel(this.entry.image?.storageRef);
    }

    get durationSeconds(): number { return (this.entry.audioMeta && this.entry.audioMeta.duration) || 0; }

    @computed
    get duration(): string {
       const val = this.durationSeconds;
       return val ? formatTimespan(val * 1000) : null;
    }

    @computed
    get date() { return formatDate(this.entry.date); }

    protected get useChanel(): number { return null; }

    get audioRms() { return this.record && this.record.audioRms; }

    @computed
    get words(): ReadonlyArray<WordReference> {
        if (!this.record) {
            return EmptyArr;
        }
        return WordReference.fromEntities(this.record.entities);
    }

    @computed
    get filteredWords() {
        if (!this._wordsFilter.selectedValue) {
            return EmptyArr;
        }

        if (this._wordsFilter.selectedValue === Categories.ALL) {
            return this.words;
        }

        const targetCats = CATEGORIES[this._wordsFilter.selectedValue];
        if (!targetCats || targetCats.length === 0) {
            return EmptyArr;
        }

        return this.words.filter(word => targetCats.some(tc => word.categories.includes(tc)));
    }

    @computed
    get chart(): ChartsData.ChartDataReadonly {
        const mergePeriod = this.transcription
            ? (this.transcription.length / 10)
            : 0;

        return ChartsData.createFromMoods(
            this.calculateSentiments(),
            mergePeriod,
            ChartsData.DateFormats.Empty,
        );
    }

    get channelsCount() {
        return (this.record && this.record.transcriptionFull && SpeechRecognition.getEffectiveChannelsCount(this.record.transcriptionFull)) || 0;
    }

    @computed
    get silencePercent() { return this.spokenPercent ? 100 - this.spokenPercent : 0; }

    @computed
    get spokenPercent() {
        const d = this.durationSeconds;
        if (d <= 0 || !this.record || !this.record.transcriptionFull) {
            return 0;
        }
        const totalSpeak = SpeechRecognition.getTotalSpeakTime(this.record.transcriptionFull, d);

        // logger.log('spoken', totalSpeak);
        return Math.round(100 * totalSpeak.relative);
    }

    overrideRecord(record: TRecord) {
        this._overrideRecord = record;
    }

    goToTranscription = () => {
        history.push(this.transcriptionRoute);
    }

    goToInner = () => {
        history.push(this.innerRoute);
    }

    private calculateSentiments(): { date: number, mood: Moods }[] {
        if (!this.record) {
            return EmptyArr;
        }

        const values = SentimentAnalysis.extractValues(this.record.sentiment)
            .map(si => ({
                date: si.date,
                mood: Moods.fromSentiment(si.score),
            }));
        return values;
    }

    protected get sentiment() { return this.record?.sentiment?.documentSentiment; }

    protected getSpeakAmountPercent(channelIndex: number) {
        const relVal = this.getSpeakAmountRelative(channelIndex);
        return Math.round(relVal * 100);
    }

    protected getSpeakAmountAbsolute(channelIndex: number) {
        if (!this.record || !this.record.transcriptionFull) {
            return 0;
        }

        const channel = this.record.transcriptionFull[channelIndex];
        if (!channel) {
            return 0;
        }

        const speak = SpeechRecognition.getSpeakTime(channel);
        return speak;
    }

    protected getSpeakAmountRelative(channelIndex: number) {
        const duration = this.entry.audioMeta && this.entry.audioMeta.duration;
        if (!duration) {
            return 0;
        }

        const speak = this.getSpeakAmountAbsolute(channelIndex);
        // const vis = SpeechRecognition.visualizeSpeech(channel, duration);
        // logger.log('Speech Visual for channel:\r\n', channelIndex, vis);
        return speak / duration;
    }
}

export class SessionItem extends ClientEntryItem<ClientSessionEntryIded, SessionRecordDataIded> {
    @observable
    private _loading: boolean;

    get title() { return this.entry.name; }

    get dateTime() { return this.entry.date; }

    protected processRecord(r: RecordDataIded): SessionRecordDataIded {
        return r.type === 'session' ? r : null;
    }

    protected get transcriptionRoute(): string { return Routes.ClientDetails.SessionTranscription(this.client.card.id, this.entry.id); }
    protected get innerRoute(): string { return Routes.ClientDetails.SessionInner(this.client.card.id, this.entry.id); }

    @computed
    get coachSpeak() { return this.getSpeakAmountPercent(0); }

    @computed
    get clientSpeak() { return this.getSpeakAmountPercent(1); }

    get loading() {
        return this._loading;
    }

    public deleteSession = () => {
        AppController.Instance.PromptModal.openModal({
            typeModal: 'negative',
            title: 'Are you sure?',
            message: 'You can’t restore deleted sessions.',
            confirmText: 'Remove Session',
            rejectText: 'Cancel',
            onConfirm: this.doDeleteSession,
        });
    }

    private doDeleteSession = async () => {
        try {
            this._loading = true;

            const result = await this.client.sessions?.delete(this.entry.id);

            if (!result.ok) {
                logger.error('Failed to delete document:', result.error);
                return;
            }

        } catch (err) {
            logger.error('Unexpected error during session deletion:', err, err.message);
        } finally {
            this._loading = false;
        }
    }

    public downloadSession = async () => {
        try {
            const fileUrl = await AppController.Instance.Storage.getFileDownloadUlr(this.entry.auidioRef);
            downloadFile(fileUrl);
        } catch (err) {
            logger.error('Failed to download session:', err, err.message);
        }
    }
}

const JournalItemTitlesByType: Record<EntryFileType, string> = {
    audio: 'Voice Check-in',
    text: 'Text Check-in',
    image: 'Picture Check-in',
};

export class JournalItem extends ClientEntryItem<ClientJournalEntryIded, JournalRecordDataIded> {

    get title() { return JournalItemTitlesByType[this.fileType]; }

    protected processRecord(r: RecordDataIded): JournalRecordDataIded {
        return r.type === 'journal' ? r : null;
    }

    get question() { return this.entry.question; }
    get location() { return this.entry.location; }
    get mood(): Moods { return Moods.findNearest(this.entry.mood); }
    get analyzedMood(): Moods { return this.sentiment && Moods.fromSentiment(this.sentiment.score); }
    get isPrivate() { return this.entry.private; }

    protected get transcriptionRoute(): string { return Routes.ClientDetails.JournalTranscription(this.client.card.id, this.entry.id); }
    protected get innerRoute(): string { return Routes.ClientDetails.JournalInner(this.client.card.id, this.entry.id); }
}
