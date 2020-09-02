import { observable, computed } from 'mobx';
import AppController from 'app/controllers';
import { StorageReferenceViewModel } from 'common/viewModels/StorageReferenceViewModel';

export default class DocsImageInnerPage {

    @observable
    private _inProgress = false;

    constructor(readonly clientId: string) { }

    get inProgress() { return this._inProgress || this.client.loading; }

    private get client() { return AppController.Instance.User.clients.getModel(this.clientId); }

    get clientName() { return this.client.displayName; }

    @computed
    get images() {
        return this.client.journal.images.map(i => ({
            image: new StorageReferenceViewModel(i.ref.storageRef),
            caption: i.entry.question,
        }));
    }
}
