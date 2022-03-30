import AppController from 'src/controllers';
import { Resource } from 'src/constants/Resource';
import AppViewModel from '.';
import { UserState } from 'common/models/userState';
import { computed, observable } from 'mobx';

export default class ResourceViewModel {

  private _availableResources: Resource[] = [];
  private _strategyColor: string = '';

  @observable
  private _resourcesForSelectedStrategies: Resource[] = [];

  public favoriteResourceSlugs: string[] = [];
  public hiddenResourceSlugs: string[] = [];

  public get availableResources() {
    return this._availableResources;
  }

  public get strategyColor() {
    return this._strategyColor;
  }

  @computed
  public get resourcesForSelectedStrategies() {
    return this._resourcesForSelectedStrategies;
  }

  public async fetchResourcesForStrategy(slug: string, strategyColor: string) {
    this._strategyColor = strategyColor;
    if (slug) {
      this._availableResources = await AppController.Instance.User.resource.getResources(slug);
    }
  }

  public async fetchResourcesForSelectedStrategies() {
    const selectedSlugs = AppViewModel.Instance.Strategy.selectedStrategies.map((s) => s.slug);
    if (selectedSlugs && selectedSlugs.length > 0) {
      this._resourcesForSelectedStrategies = await AppController.Instance.User.resource.getMultipleResources(selectedSlugs);
    }
  }

  public async fetchUsersResources(): Promise<void> {
    const userState: UserState = await AppController.Instance.User.qol.getUserState();
    this.favoriteResourceSlugs = userState.favoriteResources;
    this.hiddenResourceSlugs = userState.hiddenResources;
  }

  public async postUsersResources(): Promise<void> {
    await AppController.Instance.User.qol.setUserStateProperty('favoriteResources', this.favoriteResourceSlugs);
    await AppController.Instance.User.qol.setUserStateProperty('hiddenResources', this.hiddenResourceSlugs);
  }

}
