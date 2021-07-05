import { computed, observable } from 'mobx';
import AppController from 'src/controllers';
import PictureViewViewModel from './PictureViewViewModel';
import { Periods } from 'common/models/Periods';
import { arrayCount } from 'common/utils/mathx';
import * as ChartsData from 'common/viewModels/charts';
import { RewardsViewModel } from './RewardsViewModel';
import { CameraCapturedPicture } from 'expo-camera';
import { ImageInfo } from 'expo-image-picker/build/ImagePicker.types';
import { UserProfileViewModel } from './UserProfileViewModel';

const MERGE_PERIOD = 1000 * 3600 * 24; // 24 hrs

const isInRange = (dateMS: number) => {
    const diffMS = new Date().getTime() - dateMS;
    return diffMS < Periods.ThisWeek * 1000;
};

export class ProfileViewModel {
    @observable
    private _pictureViewVM = new PictureViewViewModel();

    readonly rewardInfoBlockVM = process.appFeatures.CLIENT_REWARDS_ENABLED
        ? new RewardsViewModel()
        : null;

    constructor() {
        // prewarm week records
        const a = this.recordsLastWeek.items.length;
    }

    private get user() {
        return AppController.Instance.User?.user;
    }
    private get authUser() {
        return AppController.Instance.Auth.authUser;
    }
    private get account() {
        return AppController.Instance.User.activeAccount;
    }

    public get name() {
        return AppController.Instance.User.displayName;
    }

    private get records() {
        return AppController.Instance.User?.records;
    }
    private get recordsLastWeek() {
        return AppController.Instance.User?.recordsLastWeek;
    }

    get wordsWeekly() {
        return this.recordsLastWeek.words;
    }

    get wordsTotal() {
        return this.records.words;
    }

    get pictureViewVM() {
        return this._pictureViewVM;
    }

    @computed
    get totalJournals() {
        const journalsCount = arrayCount(
            this.records.items,
            (r) => r.type === 'journal',
        );
        return journalsCount;
    }

    @computed
    get totalSessions() {
        const sessionsCount = arrayCount(
            this.records.items,
            (r) => r.type === 'session',
        );
        return sessionsCount;
    }

    @computed
    get totalWordsLength() {
        return this.records.items.reduce(
            (acc, curr) => acc + (curr.entities.length || 0),
            0,
        );
    }

    @computed
    get avatarURL() {
        return (
            (this.user && this.user.photoURL) ||
            (this.authUser && this.authUser.photoURL)
        );
    }

    @observable
    userAvatar: CameraCapturedPicture | ImageInfo = null;

    @computed
    private get coachProfile() {
        return new UserProfileViewModel(this.account?.coachId);
    }

    public get coachName() {
        if (this.coachProfile.busy) {
            return '...';
        }
        return (
            this.coachProfile?.value.displayName ||
            this.account?.coachName ||
            ''
        );
    }
    public get coachAvatarUrl() {
        return this.coachProfile?.value?.photoURL;
    }

    @computed
    get gradientChart() {
        const journals = AppController.Instance.User.journal.entries;
        const sentiments = journals
            .filter((j) => isInRange(j.date))
            .map((i) => ({ mood: i.mood, date: i.date }));

        return ChartsData.createFromMoods(sentiments, MERGE_PERIOD);
    }

    public saveImage = async () => {
        try {
            await this.pictureViewVM.askCameraRollPermissions();

            await this.pictureViewVM.openCameraRoll({
                allowsEditing: true,
                allowsMultipleSelection: false,
                aspect: [1, 1],
            });

            if (!this.pictureViewVM.picture) {
                return;
            }

            const f = await fetch(this.pictureViewVM.picture.uri);
            const blob = await f.blob();

            await AppController.Instance.User.saveAvatar(blob);
        } catch (error) {
            console.error('Avatar change error:', error);
        }
    };
}
