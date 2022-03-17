import { IDomainController } from 'common/abstractions/controlllers/IDomainController';
import { Domain, DomainName, FocusedDomains, SubdomainName } from '../../mobile/src/constants/Domain';
import RepoFactory from 'common/controllers/RepoFactory';

export default class DomainControllerBase implements IDomainController {

  private _userId: string;

  public setUser(userId: string) {
    this._userId = userId;
  }

  public async getPossibleDomains(): Promise<Domain[]> {
    return await RepoFactory.Instance.domains.get();
  }

  public async getFocusedDomains(): Promise<FocusedDomains> {
    return (await RepoFactory.Instance.userState.getByUserId(this._userId)).focusedDomains;
  }

}
