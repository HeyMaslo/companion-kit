
export function transferTruthyFields<T>(source: T, destination: Partial<T>, ...fields: (keyof T)[]) {
    return transferFields(source, (f, v) => !!v, destination, ...fields);
}

export function transferNotNullFields<T>(source: T, destination: Partial<T>, ...fields: (keyof T)[]) {
    return transferFields(source, (f, v) => v != null, destination, ...fields);
}

export function transferDefinedFields<T>(source: T, destination: Partial<T>, ...fields: (keyof T)[]) {
    return transferFields(source, (f, v) => v !== undefined, destination, ...fields);
}

export function transferChangedFields<T>(source: T, destination: Partial<T>, ...fields: (keyof T)[]) {
    let changed = false;

    transferFields(source, (f, v) => {
        if (v !== undefined && source[f] !== destination[f]) {
            changed = true;
            return true;
        }
        return false;
    }, destination, ...fields);

    return changed;
}

export function transferFields<T>(source: T, predicate: (f: keyof T, v: T[keyof T]) => boolean, destination: Partial<T>, ...fields: (keyof T)[]): number {
    let count = 0;
    fields.forEach(f => {
        const v = source[f];
        if (!predicate || predicate(f, v)) {
            destination[f] = v;
            ++count;
        }
    });

    return count;
}
