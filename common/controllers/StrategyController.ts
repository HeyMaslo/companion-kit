
import { IStrategyController } from 'common/abstractions/controlllers/IStrategyController';
import { StrategyIded } from '../../mobile/src/constants/Strategy';
import RepoFactory from 'common/controllers/RepoFactory';
import { UserState } from 'common/models/userState';

export default class StrategyControllerBase implements IStrategyController {

  public async getPossibleStrategies(): Promise<StrategyIded[]> {
    return await RepoFactory.Instance.strategies.get();
  }



}

