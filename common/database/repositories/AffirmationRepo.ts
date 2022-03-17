import Collections from 'common/database/collections';
import { DocumentSnapshot, Query } from './dbProvider';
import { GenericRepo } from '.';
import { Affirmation, BackendAffirmation } from '../../../mobile/src/constants/QoL';
import { LastSeen } from '../../models/userState';
import { DomainName, DomainSlug, SubdomainName } from '../../../mobile/src/constants/Domain';
import { convertFromDomainSlug, convertToDomainSlugs } from '../../../mobile/src/helpers/DomainHelper';

export default class AffirmationRepo extends GenericRepo<Affirmation> {

    get collectionName() {
        return Collections.Affirmations;
    }

    // returns all affirmations that contain any of allDomains and have not been seen by the user in the last 30 days
    async getByDomains(allDomains: (DomainName | SubdomainName)[], allowBDMention: boolean, lastSeen: LastSeen): Promise<Affirmation[]> {
        const allowedDomainSlugs = convertToDomainSlugs(allDomains);
        const query: Query = this.collection.where(nameof<BackendAffirmation>(a => a.domains), 'array-contains-any', allowedDomainSlugs);
        const docs: DocumentSnapshot[] = (await query.get()).docs;
        if (docs.length < 1) {
            return null;
        } else {
            const data = docs.map((snapshot) => {
                return { ...snapshot.data(), domains: snapshot.data().domains.map((domSlug: DomainSlug) => convertFromDomainSlug(domSlug)), id: snapshot.id } as Affirmation;
            });
            return data.filter((affirmation) => {
                if (!allowBDMention && affirmation.mentionsBD) {
                    return false;
                }
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                // true if the affirmation has not been seen before or if it has been 30 days since it was seen
                const thirtyDaysApart: boolean = !!lastSeen[affirmation.id] ? lastSeen[affirmation.id] <= thirtyDaysAgo.getTime() : true;
                return thirtyDaysApart;
            });
        }
    }
}