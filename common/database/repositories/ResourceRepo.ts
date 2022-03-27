import { GenericRepo } from 'common/database/repositories';
import Collections from 'common/database/collections';
import { Resource } from '../../../mobile/src/constants/Resource';
import { DocumentSnapshot, Query } from './dbProvider';

export default class ResourceRepo extends GenericRepo<Resource> {

  get collectionName() {
    return Collections.Resources;
  }

  // returns all Resources where 'strategySlug' equals 'slug'
  async getByStrategySlug(slug: string): Promise<Resource[]> {
    const query: Query = this.collection.where(nameof<Resource>(r => r.strategySlug), '==', slug);
    const docs: DocumentSnapshot[] = (await query.get()).docs;
    if (docs.length < 1) {
      return null;
    } else {
      const resources = docs.map((snapshot) => {
        return snapshot.data() as Resource;
      });
      return resources;
    }
  }

}
