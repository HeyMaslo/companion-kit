
export class EnumStringHelper<T extends string> {
    public readonly Keys: string[];
    public readonly Values: T[];

    constructor(
        protected readonly _obj: any,
        private readonly _valuesToStrings: { [val: string]: string } = null,
    ) {
        this.Keys = Object.keys(this._obj)
            .filter(k => typeof this._obj[k as any] === 'string');

        this.Values = this.Keys.map(k => this._obj[k]);
    }

    keyToString(key: string): string {
        return this._valuesToStrings
            ? this._valuesToStrings[this._obj[key]]
            : key;
    }

    valueToString(v: T): string {
        const custom = this._valuesToStrings && this._valuesToStrings[v];
        return custom || this._obj[v];
    }

    validateValue(v: string): T | null {
        if (!v) {
            return null;
        }
        const i = this.Values.findIndex(vv => vv === v);
        return i >= 0
            ? this.Values[i]
            : null;
    }
}

export default class EnumHelper<T extends number> {
    public readonly Keys: string[];
    public readonly Values: T[];

    constructor(
        protected readonly _obj: any,
        private readonly _valuesToStrings: Partial<Record<T, string>> = null,
    ) {
        this.Keys = Object.keys(this._obj)
            .filter(k => typeof this._obj[k as any] === 'number');

        this.Values = this.Keys.map(k => this._obj[k]);
    }

    keyToString(key: string): string {
        const vts = this._valuesToStrings as { [val: number]: string };
        return vts
            ? vts[this._obj[key]]
            : key;
    }

    keyToValue(key: string): T {
        const v = this._obj[key];
        return v == null ? null : v as T;
    }

    valueToString(v: T): string {
        const custom = this._valuesToStrings && this._valuesToStrings[v];
        return custom || this._obj[v];
    }

    validateValue(v: number): T | null {
        if (v == null || Number.isNaN(v)) {
            return null;
        }
        const i = this.Values.findIndex(vv => vv === v);
        return i >= 0
            ? this.Values[i]
            : null;
    }
}

export class EnumBitwiseHelper<T extends number> extends EnumHelper<T> {
    toStrings(value: T): string[] {
        return this.Keys
            .filter(k => this._obj[k] && this.contains(value, this._obj[k]))
            .map(k => this.keyToString(k));
    }

    toString(value: T, separator = ', '): string {
        const strs = this.toStrings(value);
        return strs.length === 0
            ? this._obj[0]
            : strs.join(separator);
    }

    contains(base: T, target: T) {
        return (base & target) === target;
    }

    combine(...values: T[]) {
        let res = 0;
        values.forEach(v => {
            res |= v;
        });
        return res;
    }

    add(value: T, other: T) {
        return value | other;
    }

    remove(value: T, other: T) {
        return value & ~other;
    }
}
