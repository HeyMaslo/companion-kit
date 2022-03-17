import { IDomainController } from 'common/abstractions/controlllers/IDomainController';
import { Domain, DomainName, FocusedDomains, SubdomainName } from '../../mobile/src/constants/Domain';
import { convertFromDomainSlug } from '../../mobile/src/helpers/DomainHelper';
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
    let focusedDomains = (await RepoFactory.Instance.userState.getByUserId(this._userId)).focusedDomains;
    return {
      domains: focusedDomains.domains.map((slug) => convertFromDomainSlug(slug) as DomainName),
      subdomains: focusedDomains.subdomains.map((slug) => convertFromDomainSlug(slug) as SubdomainName)
    }
  }

}
