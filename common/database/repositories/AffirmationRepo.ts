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

    async getByDomains(domains: string[], noBDMention: boolean, lastSeen: LastSeen): Promise<Affirmation[]> {
        const query: Query = this.collection.where(nameof<Affirmation>(a => a.domainNames), 'array-contains-any', domains);
        const docs: DocumentSnapshot[] = (await query.get()).docs;
        if (docs.length < 1) {
            return null;
        } else {
            const data = docs.map((snapshot) => { return { ...snapshot.data(), id: snapshot.id } as Affirmation; });
            return data.filter((affirmation) => {
                if (noBDMention && affirmation.mentionsBD) {
                    return false;
                }
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                // return true if the affirmation has not been seen before or if it has been 30 days since it was seen
                const thirtyDaysApart: boolean = lastSeen[affirmation.id] ? lastSeen[affirmation.id] <= thirtyDaysAgo.getTime() : true;
                return thirtyDaysApart;
            });
        }
    }
}