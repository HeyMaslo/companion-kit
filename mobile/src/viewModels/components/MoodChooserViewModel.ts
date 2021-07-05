import { observable } from 'mobx';
import Moods from 'common/models/Moods';
import logger from 'common/logger';

export default class MoodChooserViewModel {
    @observable
    private _inProgress: boolean = false;

    @observable
    private _isFinished: boolean = false;

    @observable
    private _currentMood: Moods = Moods.Default;

    private _direction: -1 | 1 = null;

    private _prevMood: Moods = null;

    get prevMood() {
        return this._prevMood;
    }
    get currentMood() {
        return this._currentMood;
    }
    get inProgress() {
        return this._inProgress;
    }
    get isFinished() {
        return this._isFinished;
    }
    get direction() {
        return this._direction;
    }

    set inProgress(value: boolean) {
        this._inProgress = value;
    }

    set isFinished(value: boolean) {
        this._isFinished = value;
    }

    public goToMood(direction: -1 | 1) {
        this._direction = direction;
        this._prevMood = this._currentMood;
        this._currentMood = this.currentMood + Moods.Step * direction;
    }

    public onFinish = () => {
        if (!this._inProgress) {
            return;
        }

        this._isFinished = true;
        this._inProgress = false;
    };

    public reset = () => {
        this._currentMood = Moods.Default;
        this._inProgress = false;
        this._isFinished = false;
        this._direction = null;
    };
}
