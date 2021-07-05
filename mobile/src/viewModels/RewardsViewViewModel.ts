import AppController from 'src/controllers';
import { RewardsViewModel } from './RewardsViewModel';

export class RewardsViewViewModel {
    readonly rewards = new RewardsViewModel();

    get clientName() {
        return AppController.Instance.User?.user?.firstName;
    }

    shareReward = () =>
        AppController.Instance.User.rewards.shareRewardWithCoach();
}
