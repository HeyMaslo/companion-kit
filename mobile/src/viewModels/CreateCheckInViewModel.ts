import MoodSliderViewModel from 'src/viewModels/components/MoodSliderViewModel';
import { Select as SelectVM } from 'common/viewModels';
import AppController from 'src/controllers';
import Locations from 'common/models/Locations';
import { computed, observable, transaction } from 'mobx';
import { getRandomQuestionsGroup, QUESTIONS_COUNT } from 'src/constants/Questions';
import RecordScreenViewModel from './RecordScreenViewModel';
import TextRecordScreenViewModel from './TextRecordScreenViewModel';
import LocationsStrings from 'common/localization/LocationStrings';
import NamesHelper from 'common/utils/nameHelper';
import Moods from 'common/models/Moods';
import MobileTracker from '../services/mobileTracker';
import * as Events from '../services/mobileTracker.events';
import { ClientJournalEntry, ClientJournalEntryIded, LabelType, TipsLabels, AudioMetadata, ImageMetadata } from 'common/models';
import { RecordsController } from 'common/controllers/RecordsController';
import { clamp, shuffle } from 'common/utils/mathx';
import { PromptType } from 'common/models/prompts';
import { TransitionObserver } from 'common/utils/transitionObserver';
import { MultiselectViewModel } from 'common/viewModels/MultiselectViewModel';
import * as Features from 'common/constants/features';
import { NotificationTypes } from 'common/models/Notifications';
import logger from 'common/logger';
import PictureViewViewModel from './PictureViewViewModel';
import { GlobalTriggers, setTriggerEnabled } from 'src/stateMachine/globalTriggers';
import { ILocalSettingsController } from 'src/controllers/LocalSettings';

export type LocationItem = {
    label: string;
    value: Locations;
    key: number;
};

const LocationItems: LocationItem[] = Locations.ActiveItems.map((l: Locations) => ({
    label: LocationsStrings[l],
    value: l,
    key: l,
}));

export enum StoryType {
    record,
    text,
}

export type BeforeSubmitState = { onboardingIndex: number, rewardLevel: number };

export default class CreateCheckInViewModel {
    readonly moodChooser = new MoodSliderViewModel();
    readonly locationSelect = new SelectVM<LocationItem>(LocationItems, item => item.label, null);

    readonly feelingsMultiSelect = process.appFeatures.INTERVENTIONS_ENABLED ? new MultiselectViewModel<LabelType>(this.feelingsList, item => item.value, []) : null;

    readonly recording = new RecordScreenViewModel();

    readonly textRecording = new TextRecordScreenViewModel();

    readonly pictureViewVM = new PictureViewViewModel();

    readonly recordsAll: RecordsController = new RecordsController();

    private _inProgress: boolean = false;

    // question reserved for current record
    @observable
    private _keptQuestion: string;

    private result: ClientJournalEntryIded;

    public beforeSubmitState: BeforeSubmitState = null;

    @observable
    private readonly _questions: QuestionsGroup = new QuestionsGroup()
        .react(() => AppController.Instance.User?.prompts?.promptsList);

    @observable
    private _uploadProgress: number | null = null;

    private get user() { return AppController.Instance.User.user; }
    private get authUser() { return AppController.Instance.Auth.authUser; }
    private readonly _settings: ILocalSettingsController = AppController.Instance.User.localSettings;

    get inProgress() { return this._inProgress; }
    set inProgress(v: boolean) {
        setTriggerEnabled(GlobalTriggers.NotificationReceived, !v);
        this._inProgress = v;
    }

    @computed
    get firstName() { return NamesHelper.ensureFromUsers(this.user, this.authUser).firstName; }

    get coachName() { return AppController.Instance.User.activeAccount.coachName || ''; }

    get question(): string {
        return this._keptQuestion || this._questions.current;
    }

    get questionPromptId() {
        return this._questions.currentId;
    }

    get canRollQuestions(): boolean {
        return this._questions.questionsLength > 1;
    }

    get showFeelingsScreen(): boolean {
        if (!process.appFeatures.INTERVENTIONS_ENABLED) {
            return false;
        }

        const chosenMood = Moods.findNearest(this.moodChooser.value);
        return chosenMood === Moods.Difficult || chosenMood === Moods.Rough;
    }

    get feelingsList(): LabelType[] {
        return process.appFeatures.INTERVENTIONS_ENABLED ? shuffle(TipsLabels.Labels) : null;
    }

    public get uploadProgress() { return this._uploadProgress; }

    @computed
    get isLocationSelected() { return this.locationSelect.index != null; }

    @computed
    get isFeelingsSelected() { return this.feelingsMultiSelect && this.feelingsMultiSelect.selectedItems.length > 0; }

    public resetFeelings = () => {
        this.feelingsMultiSelect?.reset();
    }

    public rollQuestion = () => {
        transaction(() => {
            this._keptQuestion = null;
            this._questions?.roll();
        });
        MobileTracker.Instance?.trackEvent(Events.PromptShuffle);
    }

    public keepQuestion = () => {
        if (!this._keptQuestion) {
            // remember current question
            this._keptQuestion = this.question;
            logger.log('[CreateCheckInViewModel] keeping question:', this._keptQuestion);
        }
    }

    public tryUseQuestionFromNotification() {
        const notification = AppController.Instance.User.notifications.openedNotification;
        if (notification?.type === NotificationTypes.CustomPrompt && (notification.promptId || notification.originalText)) {
            const promptsList = AppController.Instance.User.prompts?.promptsList || [];
            const prompt = promptsList.find(p => p.id === notification.promptId);

            if (prompt) {
                this._questions.forceAddQuestion(prompt.text, prompt.id);
            } else if (notification.originalText) {
                this._questions.forceAddQuestion(notification.originalText);
            }
        } else if (notification?.type === NotificationTypes.TriggerPhrase && notification.phrasePrompt) {
            this._questions.forceAddQuestion(notification.phrasePrompt);
        }
    }

    submit = async () => {
        if (this.recording.playing) {
            // TODO pause record
        }

        const audioLocal = this.recording.audioUrl;

        const uploadResult = await AppController.Instance.User.journal.uploadEntryFile(audioLocal, 'audio', progress => {
            this._uploadProgress = progress;
        });

        if (!uploadResult) {
            return;
        }

        await this.submitEntry({
            ref: uploadResult.ref,
            meta: {
                format: this.recording.encoding,
                sampleRate: this.recording.sampleRate,
                bytesSize: uploadResult.size,
                duration: this.recording.durationSec,
            },
        }, null, null);
    }

    submitTranscription = async () => {
        await this.submitEntry(null, this.textRecording.textRecord.value, null);
    }

    submitImage = async () => {
        const pic = this.pictureViewVM.picture;
        const imageLocalUri = pic.uri;
        const imageWidth = pic.width, imageHeight = pic.height;
        const uploadResult = await AppController.Instance.User.journal.uploadEntryFile(imageLocalUri, 'image', progress => {
            this._uploadProgress = progress;
        });

        if (!uploadResult) {
            return;
        }

        await this.submitEntry(null, null, {
            ref: uploadResult.ref,
            meta: {
                bytesSize: uploadResult.size,
                width: imageWidth,
                height: imageHeight,
            },
        });
    }

    private async submitEntry(audio: { ref: string, meta: AudioMetadata }, text: string, image: { ref: string, meta: ImageMetadata }) {
        // Save index for onboardingExit screen
        this._collectBeforeSubmitState();

        const entry: ClientJournalEntry = {
            location: null,
            mood: Math.round(this.moodChooser.value),
            question: this.question,
            feelings: (this.feelingsMultiSelect?.selectedValues as TipsLabels[]) || null,

            auidioRef: audio?.ref,
            audioMeta: audio?.meta,

            transcription: text,
            image: image ? {
                storageRef: image.ref,
                meta: image.meta,
            } : null,
            private: false,
        };

        const promptId = this.questionPromptId;
        if (promptId) {
            entry.meta = { promptId };
        }

        this.result = await AppController.Instance.User.journal.addEntry(entry);
        if (this.result) this._settings.updateLastDailyCheckIn( Date() );

        this.reset();
    }

    private _collectBeforeSubmitState() {
        this.beforeSubmitState = {
            // Save index for onboardingExit screen
            onboardingIndex: AppController.Instance.User.onboardingDayIndex,
            rewardLevel: AppController.Instance.User.rewards?.level,
        };
    }

    public clearBeforeSubmitState(key: keyof BeforeSubmitState = null) {
        if (key == null) {
            this.beforeSubmitState = null;
        } else if (this.beforeSubmitState) {
            this.beforeSubmitState[key] = null;
        }
    }

    private reset = () => {
        transaction(() => {
            this.recording.reset();
            this._uploadProgress = null;
            this.moodChooser.reset();
            this.locationSelect.index = null;
            this.textRecording.reset();
            this.pictureViewVM.reset();
            this._keptQuestion = null;
            this._questions.refresh(AppController.Instance.User.prompts?.promptsList);
            this.resetFeelings();
            AppController.Instance.User.notifications.resetOpenedNotification();
        });
    }

    cancel = () => {
        this.reset();
    }

    public setLastEntryPrivateness = async (isPrivate: boolean) => {
        if (!this.result || isPrivate === this.result.private) {
            return;
        }

        const journalId = this.result.id;
        await AppController.Instance.User.journal.editEntryPrivacy(journalId, isPrivate);
    }
}

class QuestionsGroup {
    @observable
    private _index: number = 0;

    @observable.ref
    private _questions: string[];

    @observable.ref
    private _questionIds: string[];

    private _observer: TransitionObserver<ReadonlyArray<PromptType>> = null;

    get questionsLength() { return this._questions?.length || 0; }
    get current() { return this.questionsLength ? this._questions[this._index] : null; }
    get currentId() { return this._questionIds[this._index]; }

    forceAddQuestion(text: string, promptId?: string) {
        this._questions.unshift(text);
        this._questionIds.unshift(promptId);
        this._index = 0;
    }

    refresh = (prompts?: ReadonlyArray<PromptType>) => {
        if (prompts && prompts.length > 0) {
            const questions = [];
            const questionIds = [];

            shuffle(prompts).slice(0, QUESTIONS_COUNT).forEach(p => {
                questions.push(p.text);
                questionIds.push(p.id);
            });

            this._questions = questions;
            this._questionIds = questionIds;
        } else {
            this._questions = getRandomQuestionsGroup();
            this._questionIds = [];
        }

        this._index = 0;

        return this;
    }

    react(getter: () => ReadonlyArray<PromptType>) {
        this._observer?.dispose();

        this._observer = new TransitionObserver(getter)
            .cb(this.refresh)
            .andForceCheck();
        return this;
    }

    roll() {
        this._index = clamp(this._index + 1, 0, this._questions.length - 1, true);
        return this.current;
    }

    dispose() {
        this._observer?.dispose();
    }
}
