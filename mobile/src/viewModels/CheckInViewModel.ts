import { reaction, transaction, observable, computed, toJS } from 'mobx';
import { asyncComputed } from 'computed-async-mobx';
import { ClientJournalEntryIded } from 'common/models/ClientEntries';
import { StorageReferenceViewModel } from 'common/viewModels/StorageReferenceViewModel';
import Firebase from 'common/services/firebase';
import * as Functions from 'common/abstractions/functions';
import LocationsStrings from 'common/localization/LocationStrings';
import { getTimeSafe, months } from 'common/utils/dateHelpers';
import { safeCall } from 'common/utils/functions';
import {
    SpeechRecognition,
    JournalRecordDataIded,
    Moods,
    TipsLabels,
    WordReference,
} from 'common/models';
import logger from 'common/logger';
import AudioPlayerViewModel from 'src/viewModels/components/AudioPlayerViewModel';
import AppController from 'src/controllers';
import EnvConstants from 'src/constants/env';
import { google } from '@google-cloud/vision/build/protos/protos';
import vision = google.cloud.vision;
import { VisionRecognition } from 'common/models/VisionRecognition';

const EmptyEntities = [];

const EmptyAudioPlayer = new AudioPlayerViewModel();

function formatDate(d: Date): string {
    return d
        .toLocaleDateString('default', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
        .toLowerCase();
}

export default class CheckInViewModel {
    @observable
    private _checkInId: string;

    @observable
    private _toggleInProgress = false;

    @observable.ref
    private _audioPlayer: AudioPlayerViewModel = null;

    @observable.ref
    private _testRecord: JournalRecordDataIded = null;

    private _urlObserver: () => any;

    private readonly _audioUrlFetcher = asyncComputed(null, 200, async () => {
        const refPath = this.audioRef;
        if (!refPath) {
            return null;
        }

        logger.log(' ====== GET DOWNLOAD URL FOR AUDIO REF: ', refPath);
        const url = await AppController.Instance.Storage.getFileDownloadUlr(
            refPath,
        );
        return url;
    });

    @computed
    get checkIn(): ClientJournalEntryIded {
        return this._checkInId == null
            ? null
            : AppController.Instance.User.journal.entries.find(
                  (e) => e.id === this._checkInId,
              );
    }

    @computed
    get record(): Readonly<JournalRecordDataIded> {
        if (this._testRecord) {
            return this._testRecord;
        }

        const ref =
            this.checkIn &&
            AppController.Instance.User.records.observeRecord(this.checkIn.id);
        const r = ref?.record;
        if (r?.type === 'journal') {
            return r;
        }
        return null;
    }

    @computed
    get title() {
        return this.audioTranscription || this.transcription || this.question;
    }

    get question() {
        return this.checkIn && this.checkIn.question;
    }

    @computed
    get date() {
        const date = new Date(getTimeSafe(this.checkIn?.date, new Date(0)));

        return `${
            months[date.getMonth()]
        } ${date.getDate()}, ${date.getFullYear()}`;
    }

    @computed
    get location() {
        return this.checkIn && LocationsStrings[this.checkIn.location];
    }

    get transcription() {
        return this.checkIn && this.checkIn.transcription;
    }

    @computed
    get audioTranscription() {
        return (
            this.record &&
            this.record.transcriptionFull &&
            SpeechRecognition.merge(this.record.transcriptionFull)
        );
    }

    @computed
    private get duration() {
        return this.checkIn && this.checkIn.audioMeta?.duration;
    }

    @computed
    private get audioRef() {
        // if (this._recordFetcher.busy) {
        //     return null;
        // }

        return this.checkIn && this.checkIn.auidioRef;
    }

    @computed
    get imageUrl() {
        return new StorageReferenceViewModel(this.checkIn?.image?.storageRef);
    }

    @computed
    get feelings() {
        return (
            this.checkIn?.feelings?.length &&
            this.checkIn.feelings.map((feel) => TipsLabels.Strings[feel])
        );
    }

    @computed
    get recommendedTips() {
        if (
            process.appFeatures.INTERVENTIONS_ENABLED &&
            this.checkIn?.feelings?.length
        ) {
            const feelings = this.checkIn.feelings.map(
                (feeling: TipsLabels) => ({ name: feeling, score: 1 }),
            );
            return AppController.Instance.User.prompts.tipsByFeeling(
                feelings,
                true,
            );
        }
        return null;
    }

    get audioUrl() {
        return this._audioUrlFetcher.get();
    }

    get audioPlayer() {
        return this._audioPlayer || EmptyAudioPlayer;
    }

    @computed
    get mood(): Moods {
        return this.checkIn?.mood && Moods.findNearest(this.checkIn.mood);
    }

    get id() {
        return this._checkInId;
    }

    @computed
    get processResultDebug(): string {
        if (!EnvConstants.ShowRecordStats || !this.record) {
            return null;
        }

        const view =
            this.record.entities.length > 5
                ? {
                      ...toJS(this.record),
                      entities: 'truncated',
                      entitiesCount: this.record.entities.length,
                  }
                : this.record;

        return JSON.stringify(view, null, 2);
    }

    @computed
    get recordEntities(): ReadonlyArray<WordReference> {
        if (this.record?.vision) {
            return VisionRecognition.fromVisionRecognition(this.record.vision);
        }
        return this.record
            ? WordReference.fromEntities(this.record.entities)
            : EmptyEntities;
    }

    get isPrivate() {
        return this.checkIn ? this.checkIn.private : undefined;
    }
    get toggleInProgress() {
        return this._toggleInProgress;
    }

    public setCheckInId(id: string) {
        transaction(() => {
            this._checkInId = id;
            this._audioPlayer?.reset();
            this._testRecord = null;
        });
        return this;
    }

    public updateAudioUrl() {
        if (this._urlObserver) {
            return;
        }

        this._urlObserver = reaction(
            (_) => this.audioUrl,
            (url) => {
                transaction(() => {
                    this._audioPlayer?.reset();
                    if (url) {
                        logger.log(
                            '[CheckInViewModel] setting audio url',
                            this.audioRef,
                            ' ====> ',
                            url,
                        );
                        this._audioPlayer = new AudioPlayerViewModel();
                        this._audioPlayer.url = url;
                        this._audioPlayer.setup();
                    }
                });
            },
        );
    }

    public _deleteCheckInAsync = async () => {
        try {
            await AppController.Instance.User.journal.deleteEntry(this.id);
        } catch (err) {
            logger.warn('Failed to delete check-in, error below');
            logger.error(err);
        }
    };

    manualProcess = async () => {
        if (!EnvConstants.AllowManualProcessing) {
            return;
        }

        const record = await Firebase.Instance.getFunction(
            Functions.AI.ProcessAudioEntry,
        ).execute({
            type: 'journal',
            clientUid: AppController.Instance.User.user.id,
            entryId: this._checkInId,
            accountId: AppController.Instance.User.activeAccount.id,
            force: true,
        });

        if (record && record.type === 'journal') {
            this._testRecord = record;
        }
    };

    public togglePrivateness = async () => {
        if (this._toggleInProgress) {
            return false;
        }

        this._toggleInProgress = true;
        const val = !this.isPrivate;
        try {
            // optimistically set new value
            this.checkIn.private = val;
            await AppController.Instance.User.journal.editEntryPrivacy(
                this.id,
                val,
            );
        } catch (err) {
            // restore prev value
            this.checkIn.private = !val;
        } finally {
            this._toggleInProgress = false;
        }
    };

    public clearModel = () => {
        this._checkInId = null;
        // this._audioUrl = null;
    };

    public dispose = () => {
        safeCall(this._urlObserver);
    };
}
