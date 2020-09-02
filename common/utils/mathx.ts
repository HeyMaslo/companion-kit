
export function clamp(val: number, min: number, max: number, cycle = false) {
    if (val < min) {
        return cycle ? max : min;
    }

    if (val > max) {
        return cycle ? min : max;
    }

    return val;
}

export function clamp01(val: number) {
    return clamp(val, 0, 1, false);
}

export function arrayCompareG<T>(arr: ReadonlyArray<T>, cond: (current: T, previous: T) => boolean): T {
    if (!Array.isArray(arr) || arr.length <= 0) {
        return null;
    }

    let result: T = arr[0];
    for (let i = 1; i < arr.length; i++) {
        const current: T = arr[i];
        if (cond(current, result)) {
            result = current;
        }
    }

    return result;
}

export function arrayCompare(arr: number[], absolute: boolean, cond: (i: number, t: number) => boolean) {
    if (!Array.isArray(arr) || arr.length <= 0) {
        return null;
    }

    let max = arr[0];
    for (let i = 1; i < arr.length; i++) {
        const e = absolute ? Math.abs(arr[i]) : arr[i];
        if (cond(e, max)) {
            max = e;
        }
    }

    return max;
}

export function arrayMax(arr: number[], absolute = false) {
    return arrayCompare(arr, absolute, (e, max) => e > max);
}

export function arrayMin(arr: number[], absolute = false) {
    return arrayCompare(arr, absolute, (e, min) => e < min);
}

export function arrayAverage(arr: number[], absolute = false) {
    if (!Array.isArray(arr) || arr.length <= 0) {
        return 0;
    }

    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        const e = absolute ? Math.abs(arr[i]) : arr[i];
        sum += e;
    }

    return sum / arr.length;
}

export function arrayCount<T>(arr: ReadonlyArray<T>, condition: (o: T) => boolean): number {
    if (!arr || !arr.length) {
        return 0;
    }

    let count = 0;
    arr.forEach(a => {
        if (condition(a)) {
            ++count;
        }
    });
    return count;
}

export function normalize(arr: number[]): number[] {
    if (arr.length === 0) {
        return arr;
    }

    const min = arrayMin(arr);
    const max = arrayMax(arr);
    const dist = max - min;
    if (Math.abs(dist) < 0.000001) { // almost zero
        return arr.map(_ => 1);
    }

    return arr.map(x => (x - min) / dist);
}

export function roundNumber(val: number, signs = 2) {
    const k = 10 ** signs;
    return Math.round((val + Number.EPSILON) * k) / k;
}

export function roundHalf(num: number): number {
    return Math.round(num * 2) / 2;
}

export function random(min: number = 0, max: number = 1, trunc = true) {
    const r = Math.random();
    const res = min + r * (max - min);
    return trunc ? Math.trunc(res) : res;
}

export function arraySwap<T>(arr: T[], i1: number, i2: number) {
    const x = arr[i1];
    arr[i1] = arr[i2];
    arr[i2] = x;
}

export function shuffle<T>(arr: T[], slice: false): T[];
export function shuffle<T>(arr: ReadonlyArray<T>): T[];
export function shuffle<T>(arr: ReadonlyArray<T>, slice: true): T[];

export function shuffle<T>(arr: T[], slice = true): T[] {
    const res = (slice ? arr?.slice() : arr) || [];

    for (let i = 0; i < res.length - 1; ++i) {
        const nextIndex = random(i + 1, res.length - 1);
        arraySwap(res, i, nextIndex);
    }

    return res;
}

export function groupBy<T, K extends string | number>(arr: ReadonlyArray<T>, grouper: (item: T) => K): Partial<Record<K, T[]>> {
    const result: Partial<Record<K, T[]>> = { };
    arr.forEach(item => {
        const k = grouper(item);
        let g = result[k];
        if (!g) {
            g = [];
            result[k] = g;
        }

        g.push(item);
    });

    return result;
}

export function groupOneBy<T, K extends string | number>(arr: ReadonlyArray<T>, grouper: (item: T) => K): Partial<Record<K, T>> {
    const result: Partial<Record<K, T>> = { };
    arr.forEach(item => {
        const k = grouper(item);
        result[k] = item;
    });

    return result;
}

export function arraySplit<T>(arr: ReadonlyArray<T>, predicate: (t: T) => boolean): [T[], T[]] {
    const trueArr: T[] = [];
    const falseArr: T[] = [];

    arr.forEach(a => {
        (predicate(a)
            ? trueArr
            : falseArr).push(a);
    });

    return [trueArr, falseArr];
}

export function findIndexLeast(num: number, arr: number[], sort = false) {
    if (sort) {
        arr.sort();
    }

    return arr.findIndex(i => i > num);
}

export function getNumberSuffix(num: number) {
    const lastDigit = (num || 0) % 10;

    switch (lastDigit) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
    }
}
