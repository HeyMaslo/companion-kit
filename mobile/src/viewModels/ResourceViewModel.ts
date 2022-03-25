import AppController from 'src/controllers';
import { Resource } from 'src/constants/Resource';

export default class ResourceViewModel {

  private _availableResources: Resource[] = [];

  public get availableResources() {
    return this._availableResources;
  }

  public async fetchResourcesForSelectedStrategy(slug: string) {
    if (slug) {
      this._availableResources =  await AppController.Instance.User.resource.getResources(slug);
    }
  }

}
