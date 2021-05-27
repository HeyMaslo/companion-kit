import { observable} from 'mobx';
import { StrategyIded } from 'common/models/QoL';

export default class ChooseStrategyViewModel {

  private _availableStrategies: StrategyIded[];
  private _selectedStrategies: StrategyIded[];

  private _strategyCount: number;

  get availableStrategies(): StrategyIded[] { return this._availableStrategies };
  get selectedStrategies(): StrategyIded[] { return this._selectedStrategies };

  get strategyCount(): number { return this._strategyCount };


  constructor() {

      this._availableStrategies = [];
      this._selectedStrategies = [];
      this._strategyCount = 0;
  }

  public setAvailableStrategies(strats: StrategyIded[]) {
      this._availableStrategies = strats;
      this._strategyCount = strats.length;
  }

  //  Returns the three strategies displayed on the choose strategy screen, main(center donain), lstrategy(strategy on left side), rstrategy(strategy on right side)
  public getStrategyDisplay(): string[] {
    // MK-TODO
    return [];
  }

  // adds selected strategies by user to the selected strategies array, use this array to persist to backend
  public selectStrategy(strategy: StrategyIded): Boolean {
      if (this._selectedStrategies.map(s => s.id).includes(strategy.id)) {
          return false;
      }
      this._selectedStrategies.push(strategy);
      return true;
  }

  public getStrategyByTitle(title: string): StrategyIded {
      let strat: StrategyIded = null;
      this._availableStrategies.forEach(s => {
          if (s.title === title) {
              strat = s;
          }
      });
      return strat;
  }

}