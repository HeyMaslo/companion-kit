import { observable} from 'mobx';
import { StrategyIded, DisplayStrategyIded } from 'common/models/QoL';

export default class ChooseStrategyViewModel {

  private allStrategies: DisplayStrategyIded[];

  @observable
  public availableStrategies: DisplayStrategyIded[];

  @observable
  public selectedStrategies: StrategyIded[];

  @observable
  public strategyThatDidntWork: StrategyIded;

  @observable
  public learnMoreStrategy: StrategyIded;


  constructor() {

      this.allStrategies, this.availableStrategies, this.selectedStrategies = [];
      this.strategyThatDidntWork, this.learnMoreStrategy = {
        id: '',
        title: '',
        details: '',
        slugs: [''],
}
  }

  public setAvailableStrategies(strats: StrategyIded[]) {
      this.availableStrategies = strats.map( (s) => {
            return  {
                id: s.id,
                title: s.title,
                details: s.details,
                slugs: s.slugs,
                isChecked: false,
            } as DisplayStrategyIded
      });
      this.allStrategies = this.availableStrategies;
  }

  public filterAvailableStrategies(strategyDomain: string) {
    if (strategyDomain == null) {
      this.availableStrategies = this.allStrategies;
    } else {
      this.availableStrategies = this.allStrategies.filter((s) => s.slugs.includes(strategyDomain))
    }
  }

  // adds selected strategies by user to the selected strategies array, use this array to persist to backend
  public selectStrategy(strategy: StrategyIded): Boolean {
      if (this.selectedStrategies.map(s => s.id).includes(strategy.id)) {
        this.selectedStrategies = this.selectedStrategies.filter(s => s.id != strategy.id)
        this.availableStrategies.find(s => s.id == strategy.id).isChecked = false;
        return false;
      }
      this.selectedStrategies.push(strategy);
      this.availableStrategies.find(s => s.id == strategy.id).isChecked = true;
      console.log('selectedStrategies', this.selectedStrategies.length)
      return true;
  }

  public getStrategyById(id: string): StrategyIded {
      let strat: StrategyIded = null;
      this.availableStrategies.forEach(s => {
          if (s.id === id) {
              strat = s;
          }
      });
      return strat;
  }

}