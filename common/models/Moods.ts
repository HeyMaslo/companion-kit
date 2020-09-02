import EnumHelper from 'common/utils/enumHelper';
import * as Mathx from 'common/utils/mathx';
import { createLazy } from 'common/utils/lazy.light';

export enum Moods {
    Undefined = 0,
    Rough = 10,
    Difficult = 20,
    Mixed = 30,
    Positive = 40,
    VeryPositive = 50,
}

export namespace Moods {

    const Helper = createLazy(() => new EnumHelper<Moods>(Moods, {
        [Moods.Rough]: 'very bad',
        [Moods.Difficult]: 'bad',
        [Moods.Mixed]: 'ok',
        [Moods.Positive]: 'good',
        [Moods.VeryPositive]: 'very good',
    }));

    export function getAll() { return Helper.value.Values; }

    export const Min = Moods.Rough;
    export const Max = Moods.VeryPositive;
    export const Default = Moods.Mixed;

    export const Step = 10;

    export function getTitle(mood: Moods) {
        return Helper.value.valueToString(findNearest(mood));
    }

    export function findNearest(value: number): Moods {
        return Math.round(Mathx.clamp(value, Min, Max) / 10) * 10 as Moods;
    }

    export function normalize(m: Moods): number {
        return (m - Min) / (Max - Min);
    }

    export function fromSentiment(value: number): Moods {
        const v = Mathx.clamp(value, -1, 1);
        let s: Moods = Moods.Undefined;
        if (v <= -0.8) {
            s = Moods.Rough;
        } else if (v <= -0.3) {
            s = Moods.Difficult;
        } else if (v <= 0.3) {
            s = Moods.Mixed;
        } else if (v <= 0.8) {
            s = Moods.Positive;
        } else {
            s = Moods.VeryPositive;
        }
        return s;
    }
}

export default Moods;
