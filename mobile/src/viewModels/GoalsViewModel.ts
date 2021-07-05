import { computed } from 'mobx';
import AppController from 'src/controllers';
import { GoalWithStatus, GoalStatus, GoalType } from 'common/models';

export class GoalItemViewModel {
    constructor(readonly goal: GoalType) {}

    @computed
    private get state() {
        return AppController.Instance.User.prompts?.goals?.getState(
            this.goal.id,
        );
    }

    get title() {
        return this.goal.text;
    }
    get status() {
        return this.state?.status || GoalStatus.New;
    }
    get isActive() {
        return this.status !== GoalStatus.Completed;
    }

    toggleComplete = () => {
        const nextStatus =
            this.status === GoalStatus.Completed
                ? GoalStatus.Incomplete
                : GoalStatus.Completed;

        AppController.Instance.User.prompts.goals.setStatus(
            this.goal.id,
            nextStatus,
        );
    };
}

const EmptyArr: GoalWithStatus[] = [];

export class GoalsViewModel {
    @computed
    private get rawGoals() {
        return (
            AppController.Instance.User.prompts?.goals?.types || EmptyArr
        ).map((g) => new GoalItemViewModel(g));
    }

    @computed
    get activeGoals() {
        return this.rawGoals.filter((g) => g.isActive);
    }

    @computed
    get achievedGoals() {
        return this.rawGoals.filter((g) => !g.isActive);
    }

    visit = () => {
        // TODO
    };
}
