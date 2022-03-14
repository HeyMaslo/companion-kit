import { observer } from 'mobx-react';
import { ScenarioTriggers } from '../../abstractions';
import AppController from 'src/controllers';
import { ReviewStrategiesView } from './ReviewStrategiesView';

@observer
export class ReviewStrategiesViewOnboarding extends ReviewStrategiesView {

  override async onNext() {
    if (AppController.Instance.User.localSettings.current.onboarding.needsStrategyOnboarding) {
      this.viewModel.completeStrategiesOnboarding()
    }
    AppController.Instance.User.localSettings.updateStrategiesConfirmed(true);
    this.trigger(ScenarioTriggers.Submit);
  }

}