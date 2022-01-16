import { observable } from 'mobx';
import { Strategy, DisplayStrategy } from '../constants/Strategy';
import { Domain, DomainName, FocusedDomains, SubdomainName } from '../constants/Domain';
import AppController from 'src/controllers';

export default class StrategyViewModel {

  private _allStrategies: DisplayStrategy[] = [];       // every strategy in the strategies collection
  private _availableStrategies: DisplayStrategy[] = []; // strategies a user could choose based on their selected domains 
  private _selectedDomains: FocusedDomains = { domains: [], subdomains: [] };

  @observable
  public availableStrategies: DisplayStrategy[] = [];

  @observable
  public selectedStrategies: Strategy[] = [];

  @observable
  public learnMoreStrategy: Strategy; // StrategyDetailsView uses this to display details (after pressing 'learn more' on a StrategyCard)

  public temporaryDisplay: DisplayStrategy[] = []; // used when showing a list of strategies regardless of selected doamins, selected strategies, etc.

  public get allStrategies(): DisplayStrategy[] {
    return this._allStrategies;
  }

  public setSelectedDomains(focusedDomains: FocusedDomains) {
    if (focusedDomains) {
      this._selectedDomains = focusedDomains;
    }
  }

  public clearSelectedDomains() {
    this._selectedDomains = { domains: [], subdomains: [] };
  }

  private setAllStrategies(strats: Strategy[]) {
    if (strats) {
      this._allStrategies = strats.map((s) => {
        return {
          internalId: s.internalId,
          title: s.title,
          shortDescription: s.shortDescription,
          details: s.details,
          associatedDomainNames: s.associatedDomainNames,
          isChecked: false,
        } as DisplayStrategy
      });
    }
  }

  public async fetchPossibleStrategies() {
    let possibleStrategies = await AppController.Instance.User.strategy.getPossibleStrategies();
    this.setAllStrategies(possibleStrategies);
  }

  // must be called after fetchPossibleStrategies
  public async fetchSelectedStrategies() {
    let chosenStrategiesIds = await AppController.Instance.User.strategy.getChosenStrategiesIds();
    if (chosenStrategiesIds) {
      this.selectedStrategies = this.allStrategies.filter((strat) => chosenStrategiesIds.includes(strat.internalId));
    }
  }

  public postSelectedStrategies(): Promise<void> {
    return AppController.Instance.User.qol.setUserStateProperty('chosenStrategies', this.selectedStrategies.map(strat => strat.internalId));
  }

  // Only include strategies from the selectedDomains and selectedSubdomains.
  public updateAvailableStrategiesForSelectedDomains() {
    const selectedDomainsAndSubdomain: string[] = (this._selectedDomains.domains.filter((dom) => dom !== DomainName.PHYSICAL) as string[]).concat(this._selectedDomains.subdomains);
    this.availableStrategies = this._allStrategies.filter((s) => s.associatedDomainNames.some(r => {
      return selectedDomainsAndSubdomain.includes(r);
    }))
    this._availableStrategies = this.availableStrategies;
  }

  public filterAvailableStrategies(strategyDomain: DomainName) {
    if (strategyDomain == null) {
      this.availableStrategies = this._availableStrategies;
    } else {
      this.availableStrategies = this._availableStrategies.filter((s) => s.associatedDomainNames.includes(strategyDomain))
    }
  }

  // adds strategies selected by user to the selected strategies array, use this array to persist to backend
  public selectStrategy(strategy: Strategy): Boolean {
    if (this.selectedStrategies.map(s => s.internalId).includes(strategy.internalId)) {
      this.selectedStrategies = this.selectedStrategies.filter(s => s.internalId != strategy.internalId)
      this.availableStrategies.find(s => s.internalId == strategy.internalId).isChecked = false;
      return false;
    } else if (this.selectedStrategies.length >= 4) {
      return false
    }
    this.selectedStrategies.push(strategy);
    this.availableStrategies.find(s => s.internalId == strategy.internalId).isChecked = true;
    return true;
  }

  public getStrategyById(id: string): Strategy {
    for (let i = 0; i < this._allStrategies.length; i++) {
      let strat = this._allStrategies[i];
      if (strat.internalId === id) {
        return strat;
      }
    }
    return null;
  }

  public completeStrategiesOnboarding() {
    AppController.Instance.User.localSettings.updateOnboardingSettings({ needsStrategyOnboarding: false }, 'needsStrategyOnboarding');
  }

}