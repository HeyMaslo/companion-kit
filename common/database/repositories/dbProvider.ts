import FirebaseClient from 'firebase/app';
import * as FirebaseAdmin from 'firebase-admin';
import Identify, { DocumentShallowReference } from 'common/models/Identify';

export type ClientFirestore = FirebaseClient.firestore.Firestore & { isClient: true };
export type ServerFirestore = FirebaseFirestore.Firestore & { isClient: false };

type DBProvider = ClientFirestore | ServerFirestore;

export type Query = FirebaseClient.firestore.Query | FirebaseFirestore.Query;
export type QuerySnapshot = FirebaseClient.firestore.QuerySnapshot | FirebaseFirestore.QuerySnapshot;
export type DocumentSnapshot = FirebaseClient.firestore.DocumentSnapshot | FirebaseFirestore.DocumentSnapshot;
export type QueryDocumentSnapshot = FirebaseClient.firestore.QueryDocumentSnapshot | FirebaseFirestore.QueryDocumentSnapshot;
export type DocumentReference = FirebaseClient.firestore.DocumentReference | FirebaseFirestore.DocumentReference;

export type CollectionReference = FirebaseClient.firestore.CollectionReference | FirebaseFirestore.CollectionReference;

export function serverOnly(provider: DBProvider, err = new Error('This method is server only')): ServerFirestore {
    if (provider.isClient === true) {
        throw err;
    }
    return provider;
}

export type QuerySnapshotCallback<T> = (items: T[]) => void | Promise<void>;
export type DocumentSnapshotCallback<T> = (item: T) => void | Promise<void>;

export type UnsubscribeSnapshot = () => void;
type AnyIded = Identify<{}>;

export function getIdentify<T extends AnyIded>(doc: DocumentSnapshot): T {
    if (!doc || !doc.exists) {
        return null;
    }

    const res = doc.data();
    res.id = doc.id;
    return res as T;
}

export function getHieararchy(docRef: DocumentReference): DocumentShallowReference {
    if (!docRef) {
        return null;
    }

    const d: DocumentShallowReference = {
        id: docRef.id,
        documentPath: docRef.path,
    };

    if (docRef.parent) {

        d.parentCollection = {
            collectionPath: docRef.parent.path,
        };

        if (docRef.parent.parent) {
            d.parentCollection.parentDocumentId = getHieararchy(docRef.parent.parent);
        }
    }
}

export function querySnapshot<T extends AnyIded>(db: DBProvider, query: Query): Promise<T[]>;
export function querySnapshot<T extends AnyIded>(db: DBProvider, query: Query,
    cb: QuerySnapshotCallback<T>): Promise<T[] | UnsubscribeSnapshot>;

export async function querySnapshot<T extends AnyIded>(
    db: DBProvider,
    query: Query,
    cb: QuerySnapshotCallback<T> = null,
) {
    const convertSnapshots = (s: QuerySnapshot): T[] => {
        const docs: DocumentSnapshot[] = s.docs;
        return docs.map((d ) => {
            const cc = d.data() as T;
            cc.id = d.id;
            return cc;
        });
    };

    if (db.isClient === true && cb) {
        const firstFetchPromise: Promise<UnsubscribeSnapshot> = new Promise(resolveP => {
            let resolve = resolveP;
            const unsubscribe = query
                .onSnapshot(async (snapshot: QuerySnapshot) => {
                    try {
                        const items = convertSnapshots(snapshot);
                        await cb(items);
                    } finally {
                        if (resolve) {
                            const r = resolve;
                            resolve = null;
                            r(unsubscribe);
                        }
                    }

                }, (err: Error) => {
                    console.warn(`querySnapshot fail: ${getQueryPath(query)}`);
                    console.error(err);
                },
            );
        });

        const res = await firstFetchPromise;
        return res;
    } else {
        const snapshot = await query.get();

        return convertSnapshots(snapshot);
    }
}

export function documentSnapshot<T extends AnyIded>(db: DBProvider, doc: DocumentReference): Promise<T>;
export function documentSnapshot<T extends AnyIded>(db: DBProvider, doc: DocumentReference,
    cb: DocumentSnapshotCallback<T>): Promise<T | UnsubscribeSnapshot>;

export async function documentSnapshot<T extends AnyIded>(
    db: DBProvider,
    doc: DocumentReference,
    cb: DocumentSnapshotCallback<T> = null,
): Promise<T | UnsubscribeSnapshot> {
    const convertSnapshot = (d: DocumentSnapshot): T => {
        if (!d.exists) {
            return null;
        }
        const res = d.data() as T;
        res.id = d.id;
        return res;
    };

    if (db.isClient === true && cb) {

        const firstFetchPromise: Promise<UnsubscribeSnapshot> = new Promise(resolveP => {
            let resolve = resolveP;
            const unsub = doc.onSnapshot(async (snapshot: DocumentSnapshot) => {
                try {
                    const item = convertSnapshot(snapshot);
                    await cb(item);
                } finally {
                    if (resolve) {
                        const r = resolve;
                        resolve = null;
                        r(unsub);
                    }
                }
            }, (err: Error) => {
                console.warn(`documentSnapshot fail: ${doc.path}`);
                console.error(err);
            });
        });

        const res = await firstFetchPromise;

        return res;
    } else {
        const snapshot = await doc.get();

        return convertSnapshot(snapshot);
    }
}

function getQueryPath(q: Query) {
    return (q as CollectionReference).path || '<query>';
}

export default DBProvider;
