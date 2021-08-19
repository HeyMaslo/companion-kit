import Collections from 'common/database/collections';
import { DocumentSnapshot, Query } from './dbProvider';
import { GenericRepo } from '.';
import { Affirmation } from '../../../mobile/src/constants/QoL';
import { Maybe } from 'common/abstractions/structures/monads';
import { LastSeen } from '../../models/userState';

export default class AffirmationRepo extends GenericRepo<Affirmation> {

    get collectionName() {
        return Collections.Affirmations;
    }

    async getByDomain(domains: string[], keywordFilter: string[], lastSeen: LastSeen): Promise<Maybe<Affirmation[]>> {
        const query: Query = this.collection
            .where(nameof<Affirmation>(a => a.domains), 'array-contains-any', domains);
        const docs: DocumentSnapshot[] = (await query.get()).docs;
        if (docs.length < 1) {
            return null;
        } else {
            const data = docs.map((af) => {return { ...af.data(), id: af.id } as Affirmation; });
            return data.filter((af) => {
                const noKeywords: boolean = !af.keywords.some(r => keywordFilter.includes(r));
                if (lastSeen === {} || !lastSeen) {
                    return noKeywords;
                }
                const thirtyAgo = new Date();
                thirtyAgo.setDate(thirtyAgo.getDate() - 30);
                const thirtyApart: boolean = lastSeen[af.id] ? lastSeen[af.id] <= thirtyAgo.getTime() : true;
                return thirtyApart && noKeywords;
            });
        }
    }
}