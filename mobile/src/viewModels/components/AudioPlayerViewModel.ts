import { observable } from 'mobx';
import AudioManager, { AudioSound, AVPlaybackStatus } from 'src/services/Audio';

export default class AudioPlayerViewModel {
    private _url: string;

    private _sound = new AudioSound();

    @observable
    private _isLoaded: boolean = false;

    @observable
    private _isPlaying: boolean = false;

    @observable.ref
    private _soundStatus: AVPlaybackStatus;

    @observable
    private _elapsedMS: number = 0;

    private _timeStartMS: number;

    public setup = async () => {
        if (this._url) {
            const playbackStatus = await this._sound.loadAsync(
                { uri: this._url },
                {},
                false,
            );
            await this._sound.setOnPlaybackStatusUpdate(this._setSoundStatus);

            this._setSoundStatus(playbackStatus);
        }
    };

    private _setSoundStatus = async (playbackStatus?: AVPlaybackStatus) => {
        this._soundStatus =
            playbackStatus || (await this._sound.getStatusAsync());

        this._isLoaded = this._soundStatus.isLoaded;
        const playingStatus =
            this._soundStatus.isLoaded && this._soundStatus.isPlaying;

        // Playing just started
        if (!this._isPlaying && playingStatus) {
            this.onStart();
        }

        this._isPlaying = playingStatus;

        if (this._soundStatus.isLoaded && this._soundStatus.didJustFinish) {
            this.onStop();
        }
    };

    public startPlayAsync = async () => {
        if (this._isLoaded) {
            await AudioManager.initialize({ forcePlayInSilent: true });

            await this._sound.playAsync();
        }
    };

    public pausePlayAsync = async () => {
        if (this._isPlaying) {
            await AudioManager.initialize();

            await this._sound.pauseAsync();
        }
    };

    public onRewinding = async (value: number) => {
        if (this._isPlaying) {
            this.pausePlayAsync();
        }
        this._setSoundStatus();
        this._sound.setPositionAsync(value);
        this._elapsedMS = value;
    };

    private _getMMSSFromMillis(millis: number = 0) {
        if (!millis) {
            return null;
        }

        const totalSeconds = millis / 1000;
        const sec_num = parseInt(totalSeconds.toFixed(0), 10);
        const minutes = Math.floor(sec_num / 60);
        const seconds = sec_num - minutes * 60;

        const padWithZero = (num: number = 0) => {
            const str = num.toString();

            if (num < 10 && num >= 0) {
                return '0' + str;
            } else if (num < 0) {
                return '00';
            }

            return str;
        };

        return padWithZero(minutes) + ':' + padWithZero(seconds);
    }

    public reset = async () => {
        if (this._isPlaying && this._sound._loaded) {
            await this._sound.stopAsync();
        }

        if (this.isLoaded && this._sound._loaded) {
            await this._sound.unloadAsync();
        }

        this._soundStatus = null;
        this._elapsedMS = 0;
        this._timeStartMS = null;

        this.onStop();
    };

    get url() {
        return this._url;
    }

    set url(val: string) {
        this._url = val;
    }

    get isPlaying() {
        return this._isPlaying;
    }

    get isLoaded() {
        return this._isLoaded;
    }

    get elapsed() {
        return this._elapsedMS;
    }

    get duration() {
        return this._soundStatus?.isLoaded && this._soundStatus.durationMillis;
    }

    get progressFormated() {
        return this._getMMSSFromMillis(
            this._soundStatus?.isLoaded && this._soundStatus.positionMillis,
        );
    }

    get timeLeftFormated() {
        const timeLeft = this.duration - this.elapsed;
        return this._getMMSSFromMillis(timeLeft);
    }

    private tick = (forceStart?: boolean) => {
        if (!this._timeStartMS) {
            return;
        }

        this._elapsedMS = new Date().getTime() - this._timeStartMS;

        if (this._isPlaying || forceStart) {
            requestAnimationFrame(() => this.tick());
        }
    };

    private onStart() {
        this._timeStartMS = new Date().getTime() - this._elapsedMS;
        this.tick(true);
    }

    private async onStop() {
        await AudioManager.initialize();
        if (this._sound._loaded) {
            if (this._isPlaying) {
                await this._sound.stopAsync();
            }

            if (this._isLoaded) {
                await this._sound.setPositionAsync(0);
            }
        }

        this._elapsedMS = 0;
        this._timeStartMS = null;
    }
}
