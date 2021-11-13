import React from 'react';
import { Container, MasloPage } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import { ReviewStrategiesView } from './ReviewStrategiesView';

export class AllStrategiesView extends ReviewStrategiesView {

  constructor(props) {
    super(props);
  }

  onBack = () => {
    this.trigger(ScenarioTriggers.Cancel);
  }

  renderContent() {
    return (
      <MasloPage style={this.baseStyles.page} onBack={this.onBack} theme={this.theme}>
        <Container style={[{ height: this._contentHeight, paddingTop: 10, paddingBottom: 10, alignItems: 'center', }]}>
          {super.renderInnerContent(`Heres how you can improve`, false)}
        </Container>
      </MasloPage>
    );
  }

}