
declare global {
    interface Array<T> {
        someAsync(cond: (v: T, index?: number, arr?: T[]) => Promise<boolean>): Promise<boolean>;
        everyAsync(cond: (v: T, index?: number, arr?: T[]) => Promise<boolean>): Promise<boolean>;

        forEachAsync(cb: (v: T, index?: number, arr?: T[]) => Promise<void>): Promise<void>;
        mapAsync<R>(cb: (v: T, index?: number, arr?: T[]) => Promise<R>): Promise<R[]>;
    }
}

export function someAsync<T>(this: T[], cond: (v: T, index?: number, arr?: T[]) => Promise<boolean>): Promise<boolean> {
    return AsyncHelpers.someAsync(this, cond);
}

export function everyAsync<T>(this: T[], cond: (v: T, index?: number, arr?: T[]) => Promise<boolean>): Promise<boolean> {
    return AsyncHelpers.everyAsync(this, cond);
}

export function forEachAsync<T>(this: T[], cb: (v: T, index?: number, arr?: T[]) => Promise<void>): Promise<void> {
    return AsyncHelpers.forEachAsync(this, cb);
}

export function mapAsync<T, R>(this: T[], cb: (v: T, index?: number, arr?: T[]) => Promise<R>): Promise<R[]> {
    return AsyncHelpers.mapAsync(this, cb);
}

export function setTimeoutAsync(ms: number) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, ms);
    });
}

export function setTimeoutFramesAsync(frames: number) {
    return new Promise(resolve => {
        let left = frames || 0;

        const cb = () => {
            if (--left <= 0) {
                resolve(0);
            } else {
                requestAnimationFrame(cb);
            }
        };

        cb();
    });
}

export const AsyncHelpers = {
    async someAsync<T>(arr: T[], cond: (v: T, index?: number, arr?: T[]) => Promise<boolean>): Promise<boolean> {
        for (let i = 0; i < arr.length; ++i) {
            const ok = await cond(arr[i], i, arr);
            if (ok) {
                return true;
            }
        }
        return false;
    },

    async everyAsync<T>(arr: T[], cond: (v: T, index?: number, arr?: T[]) => Promise<boolean>): Promise<boolean> {
        for (let i = 0; i < arr.length; ++i) {
            const ok = await cond(arr[i], i, arr);
            if (!ok) {
                return false;
            }
        }
        return true;
    },

    async forEachAsync<T>(arr: T[], cb: (v: T, index?: number, arr?: T[]) => Promise<void>): Promise<void> {
        for (let i = 0; i < arr.length; ++i) {
            await cb(arr[i], i, arr);
        }
    },

    async mapAsync<T, R>(arr: T[], cb: (v: T, index?: number, arr?: T[]) => Promise<R>): Promise<R[]> {
        const results: R[] = [];
        for (let i = 0; i < arr.length; ++i) {
            const r = await cb(arr[i], i, arr);
            results.push(r);
        }
        return results;
    },
};

if (!process.env.SKIP_ASYNC_PROTO_EXTEND) {
    Array.prototype.someAsync = someAsync;
    Array.prototype.everyAsync = everyAsync;
    Array.prototype.forEachAsync = forEachAsync;
    Array.prototype.mapAsync = mapAsync;
}
