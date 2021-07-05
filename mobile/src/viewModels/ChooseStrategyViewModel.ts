import { observable} from 'mobx';
import { StrategyIded, DisplayStrategyIded } from '../../../mobile/src/constants/Strategy';
import { DomainIded } from '../../../mobile/src/constants/Domain';

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
  }

  public setSelectedDomains(domains: DomainIded[]) {
    if (domains) {
      this._selectedDomains = domains.map((d) => d.slug);
    }
  }

  public setAvailableStrategies(strats: StrategyIded[]) {
    if (strats) {
      this.availableStrategies = strats.map( (s) => {
            return  {
                id: s.id,
                title: s.title,
                details: s.details,
                associatedDomainNames: s.associatedDomainNames,
                isChecked: false,
            } as DisplayStrategyIded
      });
      // Only include strategies from the selectedDomains
      this.availableStrategies = this.availableStrategies.filter((s) => s.associatedDomainNames.some(r => this._selectedDomains.includes(r)))
      this._allStrategies = this.availableStrategies;
    }
  }

  public filterAvailableStrategies(strategyDomain: string) {
    if (strategyDomain == null) {
      this.availableStrategies = this._allStrategies;
    } else {
      this.availableStrategies = this._allStrategies.filter((s) => s.associatedDomainNames.includes(strategyDomain))
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