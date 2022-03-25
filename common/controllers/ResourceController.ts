import RepoFactory from 'common/controllers/RepoFactory';
import { Resource } from '../../mobile/src/constants/Resource';

export default class ResourceControllerBase {

  public async getResources(strategySlug: string): Promise<Resource[]> {
    return await RepoFactory.Instance.resources.getByStrategySlug(strategySlug);
  }


}

