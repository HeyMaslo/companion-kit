import Collections from 'common/database/collections';
import { Identify } from 'common/models';
import { RepoError } from '.';
import DBProvider, { DocumentSnapshot, documentSnapshot, getIdentify, serverOnly } from './dbProvider';

function Identify<T> (d: T, id: string): Identify<T> {
    const ided: Identify<T> = {
        ... d,
        id,
    };
    return ided;
}

export default class GenericRepo<T> {

    private readonly _coll: Collections;

    /*
        Create a Generic repo with the specified collection name.
        If no name is specified, the default will be used.
        WARNING: only one default-named collection can exist at once,
        so all repositories using this collection will have their data
        merged together. Hence, it is recommended to set the name
        explicitly.
    */
    constructor(protected readonly db: DBProvider, coll: Collections = Collections.Generic) {
        this._coll = coll;
     }

    public      get collection() { return this.db.collection(this.collectionName); }

    // TODO: should we be using this?
    // private     get serverCollection() { return serverOnly(this.db).collection(Collections.Records); }

    async create(question: T): Promise<Identify<T>> {
        const collection = this.collection;
        const ref = collection.doc();
        await ref.set(question);
        const doc = await ref.get();
        return getIdentify<Identify<T>>(doc);
    }

    async getById(id: string): Promise<Identify<T>> {
        if (!id) {
            throw RepoError.InvalidArg('id');
        }
        const snap = await this.collection.doc(id).get();
        if (snap.exists) {
            return Identify<T>(snap.data() as T, id);
        } else {
            return Promise.resolve(null);
        }
    }

    async get(): Promise<Identify<T>[]> {
        const snaps = await this.collection.get();
        const results: Array<Identify<T>> = [];
        snaps.forEach((snap: DocumentSnapshot) => {
            results.push(getIdentify<Identify<T>>(snap));
        });
        return results;
    }

    get collectionName() {
        return this._coll;
    }

}