import { Maybe } from 'common/abstractions/structures/monads';
import { GenericRepo } from 'common/database/repositories';
import { Domain } from 'common/models/QoL';
import { DocumentSnapshot, Query } from 'common/database/repositories/dbProvider';

export default class DomainRepo extends GenericRepo<Domain> {

    async getBySlug(slug: string): Promise<Maybe<Domain>> {
        const query: Query = this.collection
            .where(nameof<Domain>(d => d.slug), '==', slug);
        const docs: DocumentSnapshot[] = (await query.get()).docs;
        if (docs.length < 1) {
            return null;
        } else {
            return docs[0].data() as Domain;
        }
    }

}