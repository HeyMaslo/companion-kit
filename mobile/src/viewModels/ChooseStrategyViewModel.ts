import { observable} from 'mobx';
import { StrategyIded, DisplayStrategyIded } from 'common/models/QoL';

export default class ChooseStrategyViewModel {

@observable
  public availableStrategies: DisplayStrategyIded[];

@observable
  public selectedStrategies: StrategyIded[];

  @observable
  public strategyThatDidntWork: StrategyIded;


  constructor() {

      this.availableStrategies = [];
      this.selectedStrategies = [];
      this.strategyThatDidntWork = {
        id: '',
        title: '',
        details: '',
        slug: '',
}
  }

  public setAvailableStrategies(strats: StrategyIded[]) {
      console.log('basketball')
      this.availableStrategies = strats.map( (s) => {
            return  {
                id: s.id,
                title: s.title,
                details: s.details,
                slug: s.slug,
                isChecked: false,
            } as DisplayStrategyIded
      });
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