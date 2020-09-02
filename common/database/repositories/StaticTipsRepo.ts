import Collections from 'common/database/collections';
import DBProvider, {
    QuerySnapshotCallback,
    UnsubscribeSnapshot,
    querySnapshot,
} from './dbProvider';
import { StaticTipItemIded } from 'common/models/StaticTips';

export default class StaticTipsRepo {
    constructor(readonly db: DBProvider) { }

    public get collection() { return this.db.collection(Collections.Tips); }

    get(): Promise<StaticTipItemIded[]>;
    get(cb: QuerySnapshotCallback<StaticTipItemIded>): Promise<UnsubscribeSnapshot>;

    get(cb?: QuerySnapshotCallback<StaticTipItemIded>): Promise<UnsubscribeSnapshot | StaticTipItemIded[]> {
        const query = this.collection;
        return querySnapshot(this.db, query, cb);
    }
}
