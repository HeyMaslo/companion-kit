import React from 'react';
import { Container, MasloPage } from 'src/components';
import AppViewModel from 'src/viewModels';
import { ScenarioTriggers } from '../../abstractions';
import { ReviewStrategiesView } from './ReviewStrategiesView';

export class QolHistoryStrategiesView extends ReviewStrategiesView {

  constructor(props) {
    super(props);
  }

  private get qolHistoryViewModel() {
    return AppViewModel.Instance.QoLHistory;
  }

  private get strategyViewModel() {
    return AppViewModel.Instance.Strategy;
  }

  onBack = () => {
    this.strategyViewModel.temporaryDisplay = [];
    this.trigger(ScenarioTriggers.Back);
  }

  renderContent() {
    console.log('this.strategyViewModel.temporaryDisplay', this.strategyViewModel.temporaryDisplay)
    const title = `Here are your past strategies for Week ${this.qolHistoryViewModel.selectedEntryWeekNumber}`;
    return (
      <MasloPage style={this.baseStyles.page} onBack={this.onBack} theme={this.theme}>
        <Container style={[{ height: this._contentHeight, paddingTop: 10, paddingBottom: 10, alignItems: 'center', }]}>
          {super.renderInnerContent(title, false, this.strategyViewModel.temporaryDisplay)}
        </Container>
      </MasloPage>
    );
  }

}