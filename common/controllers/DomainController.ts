import { IDomainController } from 'common/abstractions/controlllers/IDomainController';
import { DomainIded } from '../../mobile/src/constants/Domain';
import RepoFactory from 'common/controllers/RepoFactory';

export default class DomainControllerBase implements IDomainController {

    public async getPossibleDomains(): Promise<DomainIded[]> {
        return await RepoFactory.Instance.qolDomains.get();
      }



}
