import { ViewState } from '../base';
import AppViewModel from 'src/viewModels';
import { ScenarioTriggers } from '../../abstractions';
import Localization from 'src/services/localization';
import * as Features from 'common/constants/features';

const AdditionalGoodJobMessage = '';

export abstract class CheckInViewBase<
    CState = {},
    CParams = any
> extends ViewState<CState, CParams> {
    public get viewModel() {
        return AppViewModel.Instance.CreateCheckIn;
    }

    start() {
        this.viewModel.inProgress = true;
    }

    end() {
        this.viewModel.inProgress = false;
    }

    cancel = () => {
        this.viewModel.cancel();
        this.trigger(ScenarioTriggers.Cancel);
    };

    onClose = (): void | Promise<void> =>
        this.runLongOperation(async () => {
            this.showModal({
                title: 'Do you really want to delete this check-in entry?',
                primaryButton: {
                    text: 'yes, delete',
                    action: this.cancel,
                },
                secondaryButton: {
                    text: 'no, go back',
                    action: this.hideModal,
                },
            });
        });

    protected async finishEntrySubmit() {
        if (!Features.Mobile.CheckIns.AskUserAboutPrivateness) {
            this.showModal({
                title: 'Good Job!',
                message: `Thanks for sharing your thoughts with me. ${AdditionalGoodJobMessage}`,
                primaryButton: {
                    text: 'Continue',
                    action: () => this.trigger(ScenarioTriggers.Primary),
                },
                secondaryButton: null,
            });
            return;
        }

        this.showModal({
            title: `Do you want your ${Localization.Current.MobileProject.dashboardEssence} ${this.viewModel.coachName} to see this?`,
            primaryButton: {
                text: 'keep private',
                action: () => {
                    this.viewModel.setLastEntryPrivateness(true);
                    this.trigger(ScenarioTriggers.Primary);
                },
            },
            secondaryButton: {
                text: 'YES, share',
                action: () => {
                    this.viewModel.setLastEntryPrivateness(false);
                    this.trigger(ScenarioTriggers.Primary);
                },
            },
        });
    }
}
