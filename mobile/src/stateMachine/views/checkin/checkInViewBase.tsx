import { ViewState } from '../base';
import AppViewModel from 'src/viewModels';
import { ScenarioTriggers } from '../../abstractions';

export abstract class CheckInViewBase<CState = {}, CParams = any> extends ViewState<CState, CParams> {

    public get viewModel() {
        return AppViewModel.Instance.DailyCheckIn;
    }

    cancel = () => {
        this.viewModel.reset();
        this.trigger(ScenarioTriggers.Cancel);
    }

    onClose = (): void | Promise<void> => this.runLongOperation(async () => {
        this.showModal({
            title: `Do you really want to delete this check-in entry?`,
            primaryButton: {
                text: 'yes, delete',
                action: this.cancel,
            },
            secondaryButton: {
                text: 'no, go back',
                action: this.hideModal,
            },
            theme: this.theme,
        });
    })
}
