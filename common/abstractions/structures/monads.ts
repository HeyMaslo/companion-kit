type Nothing = null;
type Just<T> = T;
type Maybe<T> = Just<T> | Nothing;

function Nothing<T>(x: Maybe<T>): x is Nothing {
    return x === null;
}

function Just<T>(x: Maybe<T>): x is Just<T> {
    return x !== null;
}

function wrap<T, Y>(m: Maybe<T>, a: (t: T) => Y, b: () => Y): Y {
    if (Nothing<T>(m)) {
        return b();
    } else {
        return a(m);
    }
}

export {
    Maybe,
    wrap,
};