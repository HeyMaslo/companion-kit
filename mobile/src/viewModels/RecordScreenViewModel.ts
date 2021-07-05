import { observable } from 'mobx';
import Recorder from 'src/components/common/Recorder';
import MobileTracker, { Events } from '../services/mobileTracker';
import AudioPlayerViewModel from './components/AudioPlayerViewModel';

export enum States {
    countDown,
    recording,
    recordingPaused,
    finished,
}

const MAX_DURATION = 1.5 * 60;
const FPS60 = 1000 / 60;

export default class RecordScreenViewModel {
    private _recorder = new Recorder();

    private _player = new AudioPlayerViewModel();

    private _maxDurationSec = MAX_DURATION;

    @observable
    private _state: States;

    @observable
    private _counter: number;

    @observable
    private _diffSec: number = 0;

    @observable
    private _progress: number = 0; // ellapsed time 0..1;

    private _startTimeSec: number;

    private _progressInteval: any;

    private _countDownInteval: any;

    private _countDownBreak: boolean = false;

    get state() {
        return this._state;
    }

    set state(state: States) {
        this._state = state;
    }

    get counter() {
        return this._counter;
    }

    get progress() {
        return this._progress;
    }

    get diffSec() {
        return this._diffSec;
    }

    get audioUrl() {
        return this._recorder.uri;
    }

    get encoding() {
        return this._recorder.encoding;
    }
    get sampleRate() {
        return this._recorder.sampleRate;
    }
    get durationSec() {
        return this._recorder.duration;
    }
    get record() {
        return this._recorder.record;
    }
    get player() {
        return this._player;
    }
    get playing() {
        return this._player.isPlaying;
    }
    get active() {
        return (
            this._state === States.recording ||
            this._state === States.recordingPaused
        );
    }
    get playElapsedMS() {
        return this._player.elapsed || 0;
    }
    get maxDuration() {
        return this._maxDurationSec;
    }

    public startCountdown = async (from: number = 3) => {
        this._state = States.countDown;

        this._countDownInteval = setInterval(() => {
            this._counter = from--;
            if (this._counter === 0) {
                this.startRecordingAsync();
                clearInterval(this._countDownInteval);
            }
        }, 1000);
    };

    public cancelCountdown = () => {
        clearInterval(this._countDownInteval);
        this._diffSec = 0;
        this._counter = undefined;
        // Navigation.push(Routes.RecordType, 'pop');
    };

    public startRecordingAsync = async () => {
        try {
            await this._recorder.startRecordingAsync();
            this.startProgress();
            MobileTracker.Instance?.trackEvent(Events.RecordingStarted);
        } catch (err) {
            this.reset();
            this.cancelCountdown();
        }
    };

    private startProgress = () => {
        this._state = States.recording;
        const dateSec = new Date().getTime() / 1000;
        this._startTimeSec = this._diffSec ? dateSec - this._diffSec : dateSec;
        this._progressInteval = setInterval(this.progressTick, FPS60);
    };

    public stopRecodringAsync = async () => {
        try {
            await this._recorder.stopRecordingAsync();
            MobileTracker.Instance?.trackEvent(Events.RecordingCompleted);
        } finally {
            clearInterval(this._progressInteval);
            this._diffSec = 0;

            this._state = States.finished;
            // this._maxDurationSec = this.durationSec;

            this._player.url = this._recorder.uri;

            this._player.setup();
        }
    };

    public togglePlayingAsync = async () => {
        if (!this._player.isLoaded) {
            await this._player.setup();
        }

        if (this._player.isPlaying) {
            await this._player.pausePlayAsync();
        } else {
            await this._player.startPlayAsync();
        }
    };

    private progressTick = async () => {
        this._diffSec = new Date().getTime() / 1000 - this._startTimeSec;
        this._progress = this._diffSec / this._maxDurationSec;

        if (this._progress >= 1 && this._state === States.recording) {
            await this.stopRecodringAsync();
        }
    };

    public reset = async () => {
        try {
            if (this._state && this._state !== States.finished) {
                await this._recorder.unloadRecord();
            }

            await this._recorder.clear();
            await this._player.reset();

            this._recorder = new Recorder();
            this._diffSec = 0;
            this._counter = undefined;
            this._progress = 0;
            this._state = null;
            this._maxDurationSec = MAX_DURATION;
            clearInterval(this._countDownInteval);
        } catch (err) {
            console.warn(err);
        }
    };

    pauseAsync = async () => {
        clearInterval(this._progressInteval);
        await this._recorder.pauseAsync();
        this._state = States.recordingPaused;
    };

    resumeAsync = async () => {
        clearInterval(this._progressInteval);
        await this._recorder.resumeAsync();
        this._state = States.recording;
        this.startProgress();
    };

    public pausePlayAsync = () => this._player.pausePlayAsync();
}
