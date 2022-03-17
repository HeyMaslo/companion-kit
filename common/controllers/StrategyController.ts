
import { IStrategyController } from 'common/abstractions/controlllers/IStrategyController';
import { BackendStrategy, Strategy } from '../../mobile/src/constants/Strategy';
import RepoFactory from 'common/controllers/RepoFactory';
import { convertFromDomainSlug } from '../../mobile/src/helpers/DomainHelper';

export default class StrategyControllerBase implements IStrategyController {

  private _userId: string;

  public setUser(userId: string) {
    this._userId = userId;
  }

  public async getPossibleStrategies(): Promise<Strategy[]> {
    let backendStrategies: BackendStrategy[] = await RepoFactory.Instance.strategies.get();
    return backendStrategies.map((bs) => {
      return { ...bs, domains: bs.domains.map((domSlug) => convertFromDomainSlug(domSlug)) }
    });
  }

  public async getChosenStrategiesSlugs(): Promise<string[]> {
    return (await RepoFactory.Instance.userState.getByUserId(this._userId)).chosenStrategies;
  }


}

