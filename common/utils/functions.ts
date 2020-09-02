
type PropertiesOf<T> = Exclude<{
    [K in keyof T]: T[K] extends Function ? never : K
}[keyof T], undefined>;

export type RemoveFunctionFields<T> = {
    readonly [P in PropertiesOf<T>]: T[P];
};

export function safeCall<T extends (...args: any) => any>(cb: T, ...args: Parameters<T>): ReturnType<T> {
    if (cb) {
        return cb.apply(null, args);
    }
}

export type SortingFunction<T> = (i1: T, i2: T) => number;
