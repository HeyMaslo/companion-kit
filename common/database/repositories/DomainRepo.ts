import { Maybe } from 'common/abstractions/structures/monads';
import { GenericRepo } from 'common/database/repositories';
import { Domain, DomainName } from '../../../mobile/src/constants/Domain';
import { DocumentSnapshot, Query } from 'common/database/repositories/dbProvider';
import Collections from 'common/database/collections';

export default class DomainRepo extends GenericRepo<Domain> {

    get collectionName() {
        return Collections.Domains;
    }

    async getByName(name: DomainName): Promise<Maybe<Domain>> {
        const query: Query = this.collection
            .where(nameof<Domain>(d => d.name), '==', name);
        const docs: DocumentSnapshot[] = (await query.get()).docs;
        if (docs.length < 1) {
            return null;
        } else {
            return docs[0].data() as Domain;
        }
    }

}
