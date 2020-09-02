import { observable } from 'mobx';
import { asyncComputed } from 'computed-async-mobx';
import { StorageController } from 'common/controllers/StorageController';

export class StorageReferenceViewModel {

    @observable
    public ref: string;

    private readonly _urlFetcher = asyncComputed(null, 200, async () => {
        if (!this.ref) {
            return null;
        }

        const url = await StorageController.Instance.getFileDownloadUlr(this.ref);
        return url;
    });

    constructor(ref: string) {
        this.ref = ref;
    }

    get url() { return this._urlFetcher.get(); }
}
