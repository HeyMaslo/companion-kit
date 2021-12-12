import { ViewState } from '../base';
import React from 'react';
import { MasloPage, Container, Card, Button } from 'src/components';
import { PersonaStates } from '../../abstractions';
import { PersonaViewPresets } from 'src/stateMachine/persona';
import AppViewModel from 'src/viewModels';
import { observable } from 'mobx';

export abstract class NotificationsOnboardingBaseView extends ViewState {

  @observable
  protected continueButtonDisabled = false;

  constructor(props) {
    super(props);
    this._contentHeight = this.persona.setupContainerHeightForceScrollDown({ transition: { duration: 0 } });
    this.hidePersona2();
  }

  get viewModel() {
    return AppViewModel.Instance.Settings.notifications;
  }

  async start() {
    
  }

  abstract onBack: () => void;

  abstract onNext: () => void;

  abstract renderInnerContent(): JSX.Element;


  renderContent() {
    return (
      <MasloPage style={this.baseStyles.page} onBack={() => this.onBack()} theme={this.theme}>
        <Container style={[{ height: '100%', flexDirection: 'column', alignItems: 'center', paddingTop: 10 }]}>
          {this.renderInnerContent()}
          <Button
            title='Continue'
            style={{ marginTop: 'auto' }}
            onPress={this.onNext}
            theme={this.theme}
            disabled={this.continueButtonDisabled}
          />
        </Container>
      </MasloPage >
    );
  }
}
