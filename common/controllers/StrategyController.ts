
import { IStrategyController } from 'common/abstractions/controlllers/IStrategyController';
import { Strategy } from '../../mobile/src/constants/Strategy';
import RepoFactory from 'common/controllers/RepoFactory';

export default class StrategyControllerBase implements IStrategyController {

  private _userId: string;

  public setUser(userId: string) {
    this._userId = userId;
  }

  public async getPossibleStrategies(): Promise<Strategy[]> {
    return await RepoFactory.Instance.strategies.get();
  }

  public async getChosenStrategiesIds(): Promise<string[]> {
    return (await RepoFactory.Instance.userState.getByUserId(this._userId)).chosenStrategies;
  }


}

