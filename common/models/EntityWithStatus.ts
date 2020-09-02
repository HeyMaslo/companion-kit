export type StatusWithDate<TStatus extends string = string> = {
    status: TStatus,
    date: number,
};

export type EntityWithStatus<TStatus extends string> = StatusWithDate<TStatus> & {
    history?: { d: number, s: TStatus }[],
};

export namespace EntityWithStatus {

    export function changeStatus<T extends EntityWithStatus<TStatus>, TStatus extends string>(entity: Partial<T>, status: TStatus, date: number = null, allowStatusUpdate = false) {
        if (!entity) {
            return false;
        }

        if (entity.status === status && !allowStatusUpdate) {
            return false;
        }

        if (!entity.history) {
            entity.history = [];
        }

        entity.history.push({ d: entity.date || null, s: entity.status || null });
        entity.date = date || Date.now();
        entity.status = status;
        return true;
    }

    export function getLastStatusDate<T extends EntityWithStatus<TStatus>, TStatus extends string>(entity: T, ...statuses: TStatus[]) {
        if (!entity || !statuses.length) {
            return null;
        }

        if (statuses.includes(entity.status)) {
            return entity.date;
        }

        if (entity.history && entity.history.length) {
            const t = entity.history.find(h => statuses.includes(h.s));
            if (t) {
                return t.d;
            }
        }

        return null;
    }

    export function getFullHistory<T extends EntityWithStatus<TStatus>, TStatus extends string>(entity: T): StatusWithDate<TStatus>[] {
        const result: { date: number, status: TStatus }[] = [];
        if (entity.history?.length) {
            result.push(...entity.history.map(h => ({ date: h.d, status: h.s })));
        }
        result.push({ date: entity.date, status: entity.status });
        return result;
    }

}