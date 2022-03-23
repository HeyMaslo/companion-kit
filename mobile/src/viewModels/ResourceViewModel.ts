import { transaction, observable, computed } from 'mobx';
import { ClientJournalEntryIded } from 'common/models/ClientEntries';
import { safeCall } from 'common/utils/functions';
import AppController from 'src/controllers';

export default class ResourceViewModel {

  @observable
  private _resourceId: string;

  @observable
  private _title: string;

  @observable
  private _iconName: string;

  @observable
  private _category: ResourceType;

  @observable
  private _backgroundColor: string;

  @observable _isFavorite: boolean;

  @observable
  private _toggleInProgress = false;

  private _urlObserver: () => any;

  @computed
  get checkIn(): ClientJournalEntryIded {
    return this._resourceId == null ? null : AppController.Instance.User.journal.entries.find(e => e.id === this._resourceId);
  }

  get title() { return this._title; }
  get category() { return this._category; }
  get backgroundColor() { return this._backgroundColor; }
  get id() { return this._resourceId; }
  get isFavorite() { return this._isFavorite; }

  get toggleInProgress() { return this._toggleInProgress; }

  constructor(resourceId: string, title: string, category: ResourceType, backgroundColor: string, isFavorite: boolean) {
    this._resourceId = resourceId;
    this._title = title;
    this._category = category;
    this._backgroundColor = backgroundColor;
    this._isFavorite = isFavorite;
  }

  public setCheckInId(id: string) {
    transaction(() => {
      this._resourceId = id;
    });
    return this;
  }

  public clearModel = () => {
    this._resourceId = null;
  }

  public dispose = () => {
    safeCall(this._urlObserver);
  }
}


export enum ResourceType {
  ARTICLE = 'Article',
  VIDEO = 'Video',
  WEBINAR = 'article',
  APP = 'App',
  BLOG = 'Blog',
  OTHER = 'Other',
  WORKSHEET = 'Worksheet',
  YOUTUBECHANNEL = 'Youtube Channel'
}