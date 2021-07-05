import AppController from 'src/controllers';

export class RewardsViewModel {
    private get controller() {
        return AppController.Instance.User.rewards;
    }

    get currentCheckInsCount() {
        return this.controller.currentCheckInsCount;
    }

    get streak() {
        return this.controller.streak;
    }

    get level() {
        return this.controller.level;
    }

    get nextLevelCount() {
        return this.controller.nextLevelCount;
    }

    get grade() {
        return this.controller.grade;
    }

    get progress() {
        return this.controller.progress;
    }
}
