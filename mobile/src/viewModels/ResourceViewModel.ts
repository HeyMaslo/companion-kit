import AppController from 'src/controllers';
import { Resource } from 'src/constants/Resource';

export default class ResourceViewModel {

  private _availableResources: Resource[] = [];
  private _strategyColor: string = '';

  public get availableResources() {
    return this._availableResources;
  }

  public get strategyColor() {
    return this._strategyColor;
  }

  public async fetchResourcesForSelectedStrategy(slug: string, strategyColor: string) {
    this._strategyColor = strategyColor;
    if (slug) {
      this._availableResources = await AppController.Instance.User.resource.getResources(slug);
    }
  }

}
