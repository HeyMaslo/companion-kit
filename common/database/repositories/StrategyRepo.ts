import { Maybe } from 'common/abstractions/structures/monads';
import { GenericRepo } from 'common/database/repositories';
import { Strategy } from 'common/models/QoL';
import { DocumentSnapshot, Query } from 'common/database/repositories/dbProvider';
import Collections from 'common/database/collections';

export default class StrategyRepo extends GenericRepo<Strategy> {

    get collectionName() {
        return Collections.Strategies;
    }

    async getBySlug(slug: string): Promise<Maybe<Strategy>> {
        const query: Query = this.collection
            .where(nameof<Strategy>(d => d.slug), '==', slug);
        const docs: DocumentSnapshot[] = (await query.get()).docs;
        if (docs.length < 1) {
            return null;
        } else {
            return docs[0].data() as Strategy;
        }
    }

}
