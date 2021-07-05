import { observable } from 'mobx';
import Moods from 'common/models/Moods';
import * as Mathx from 'common/utils/mathx';

export default class MoodSliderViewModel {
    @observable
    private _value: number = Moods.Default;

    get minValue(): number {
        return Moods.Min;
    }
    get maxValue(): number {
        return Moods.Max;
    }

    get value() {
        return this._value;
    }
    get currentMood() {
        return this._value != null
            ? Moods.findNearest(this._value)
            : Moods.VeryPositive;
    }

    set value(value: number) {
        if (value != null) {
            this._value = Mathx.clamp(value, this.minValue, this.maxValue);
        }
    }

    public reset = () => {
        this._value = Moods.Default;
    };
}
