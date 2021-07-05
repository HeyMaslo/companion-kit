import { asyncComputed } from 'computed-async-mobx';
import AppController from 'src/controllers';

export class UserProfileViewModel {
    private readonly _coachProfileFetcher = asyncComputed(null, 0, async () => {
        if (!this.userId) {
            return;
        }

        const publicProfile = await AppController.Instance.User.getUserPublicInfo(
            this.userId,
        );
        return publicProfile;
    });

    constructor(readonly userId: string) {}

    get value() {
        return this._coachProfileFetcher.get();
    }

    get busy() {
        return this._coachProfileFetcher.busy;
    }
}
