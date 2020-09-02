import { observable } from 'mobx';
import logger from 'common/logger';
import { AudioMetadata } from 'common/models';
import { StorageController } from 'common/controllers/StorageController';

type AudioInfo = {
    audioRef: string;
    title?: string;
    description?: string;
    audioMeta: AudioMetadata;
    src?: string;
};

export default class AudioPlayerViewModel {
    private _src: string;

    @observable
    private _elapsedMS: number = 0;

    @observable
    private _startTimeMS: number;

    @observable
    private _playing: boolean;

    @observable
    private _error: string;

    @observable
    private _ready: boolean;

    @observable
    private _progress: number = 0;

    private _interval: number | NodeJS.Timeout;
    // private _interval: number;

    private _overrideAudioRef: string;

    constructor(public readonly audioInfo: AudioInfo) {
        this._src = audioInfo.src;
    }

    get description() { return this.audioInfo.description; }
    get duration() { return this.audioInfo.audioMeta && (this.audioInfo.audioMeta.duration * 1000); }
    get title() { return this.audioInfo.title; }

    get elapsedMS() { return this._elapsedMS; }
    get progress() { return this._progress; }
    get playing() { return this._playing; }
    get error() { return this._error; }
    get ready() { return this._ready; }
    set error(err: string) { this._error = err; }
    set ready(ready: boolean) { this._ready = ready; }

    public setRef(auidioRef: string) {
        this._overrideAudioRef = auidioRef;
        this._src = null;
    }

    public getSource = async () => {
        if (this._src) {
            return this._src;
        }

        const ref = this._overrideAudioRef || this.audioInfo.audioRef;
        try {
            const url = await StorageController.Instance.getFileDownloadUlr(ref);
            this._src = url;

            return this._src;
        } catch (err) {
            logger.warn('File for ref', ref, 'was not found');
            return null;
        }
    }

    public onStart = () => {
        this._playing = true;
        this._startTimeMS = new Date().getTime() - this._elapsedMS;
        this._interval = setInterval(() => this._tick(), 60 / 1000);
    }

    public onPause = () => {
        clearInterval(this._interval as number);
        this._playing = false;
    }

    public onSeek = (toMS: number) => {
        this._elapsedMS = toMS;
        this._startTimeMS = new Date().getTime() - this._elapsedMS;
        this._tick();
    }

    private _tick() {
        const d = this.duration;
        if (this._progress < 100) {
            this._elapsedMS = new Date().getTime() - this._startTimeMS;
            this._progress = 100 - (d - this._elapsedMS) * 100 / d;
        }
    }

    public onEnded = () => {
        this.onPause();

        this._progress = 0;
        this._elapsedMS = 0;
        this._progress = 0;
    }
}