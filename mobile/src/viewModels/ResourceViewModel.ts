import AppController from 'src/controllers';
import { Resource, ResourceType } from 'src/constants/Resource';

export default class ResourceViewModel {

  private _selectedStrategySlug: string = '';

  private _availableResources: Resource[] = [];

  public get availableResources() {
    return this._availableResources;
  }

  // @observable
  // public learnMoreStrategy: Strategy; // StrategyDetailsView uses this to display details (after pressing 'learn more' on a StrategyCard)

  public setSelectedStrategy(slug: string) {
    if (slug) {
      this._selectedStrategySlug = slug;
    }
  }

  public async fetchResourcesForSelectedStrategy() {
    if (this._selectedStrategySlug) {
      const resources = await AppController.Instance.User.resource.getResources(this._selectedStrategySlug);
      this._availableResources = resources;
    }
  }

}

// export default class ResourceViewModel {

//   @observable
//   private _resourceId: string;

//   @observable
//   private _title: string;

//   @observable
//   private _iconName: string;

//   @observable
//   private _category: ResourceType;

//   @observable
//   private _backgroundColor: string;

//   @observable _isFavorite: boolean;

//   private _urlObserver: () => any;

//   @computed
//   get checkIn(): ClientJournalEntryIded {
//     return this._resourceId == null ? null : AppController.Instance.User.journal.entries.find(e => e.id === this._resourceId);
//   }

//   get title() { return this._title; }
//   get category() { return this._category; }
//   get backgroundColor() { return this._backgroundColor; }
//   get id() { return this._resourceId; }
//   get isFavorite() { return this._isFavorite; }

//   constructor(resourceId: string, title: string, category: ResourceType, backgroundColor: string, isFavorite: boolean) {
//     this._resourceId = resourceId;
//     this._title = title;
//     this._category = category;
//     this._backgroundColor = backgroundColor;
//     this._isFavorite = isFavorite;
//   }

//   public setCheckInId(id: string) {
//     transaction(() => {
//       this._resourceId = id;
//     });
//     return this;
//   }

//   public clearModel = () => {
//     this._resourceId = null;
//   }

//   public dispose = () => {
//     safeCall(this._urlObserver);
//   }
// }
