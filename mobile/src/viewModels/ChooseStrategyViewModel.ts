import { observable} from 'mobx';
import { StrategyIded, DisplayStrategyIded, DomainIded } from 'common/models/QoL';

export default class ChooseStrategyViewModel {

  private _selectedDomains: string[];
  private _allStrategies: DisplayStrategyIded[];

  @observable
  public availableStrategies: DisplayStrategyIded[];

  @observable
  public selectedStrategies: StrategyIded[];

  @observable
  public learnMoreStrategy: StrategyIded;

  get selectedDomains(): string[] {
    return this._selectedDomains;
  }

  constructor() {

      this._selectedDomains, this._allStrategies, this.availableStrategies, this.selectedStrategies = [];
      this.learnMoreStrategy = {
        id: '',
        title: '',
        details: '',
        slugs: [''],
      }
  }

  public setSelectedDomains(domains: DomainIded[]) {
    this._selectedDomains = domains.map((d) => d.slug);
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
      // Only include strategies from the selectedDomains
      this.availableStrategies = this.availableStrategies.filter((s) => s.slugs.some(r => this._selectedDomains.includes(r)))
      this._allStrategies = this.availableStrategies;
  }

  public filterAvailableStrategies(strategyDomain: string) {
    if (strategyDomain == null) {
      this.availableStrategies = this._allStrategies;
    } else {
      this.availableStrategies = this._allStrategies.filter((s) => s.slugs.includes(strategyDomain))
    }
  }

  // adds strategies selected by user to the selected strategies array, use this array to persist to backend
  public selectStrategy(strategy: StrategyIded): Boolean {
      if (this.selectedStrategies.map(s => s.id).includes(strategy.id)) {
        this.selectedStrategies = this.selectedStrategies.filter(s => s.id != strategy.id)
        this.availableStrategies.find(s => s.id == strategy.id).isChecked = false;
        return false;
      } else if (this.selectedStrategies.length >= 4) {
        return false
      }
      this.selectedStrategies.push(strategy);
      this.availableStrategies.find(s => s.id == strategy.id).isChecked = true;
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