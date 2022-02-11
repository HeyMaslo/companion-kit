import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View } from 'react-native';
import { ViewState } from '../base';
import AppController from 'src/controllers';
import { ScenarioTriggers } from '../../abstractions';
import { Button, Container, MasloPage } from 'src/components';
import TextStyles from 'src/styles/TextStyles';
import { observable } from 'mobx';
import { PersonaViewPresets } from 'src/stateMachine/persona';

@observer
export class AfterHealthPromptView extends ViewState {

  @observable
  private healthPromptWasSuccessful: boolean = AppController.Instance.User?.healthPermissionsController.permissionsGranted;

  constructor(props) {
    super(props);
    this.persona.view = PersonaViewPresets.TopHalfOut;
    this.persona.armsHidden = true;
  }

  async start() {
    this.healthPromptWasSuccessful = AppController.Instance.User?.healthPermissionsController.permissionsGranted;
  }

  onNext = () => {
    this.trigger(ScenarioTriggers.Next)
  }

  renderContent() {
    const successTitle = 'Thank you, I have successfully received your health data!'
    const successSubtitle = 'PolarUs will be receiving health data in the background every day.'


    const failureTitle = 'I wasn’t able to receive any of your health data'
    const failureSubtitle = 'Your device may not be capturing any health data. You may have to grant permissions in Apple Health to give access to your health data.'

    return (
      <MasloPage style={this.baseStyles.page} theme={this.theme}>
        <Container style={[{ height: '100%', flexDirection: 'column', alignItems: 'center', paddingTop: 60 }]}>
          <Text style={[TextStyles.h1, styles.title, { color: this.theme.colors.foreground }]}>{this.healthPromptWasSuccessful ? successTitle : failureTitle}</Text>
          <Text style={[TextStyles.h2, styles.title, { color: this.theme.colors.foreground }]}>{this.healthPromptWasSuccessful ? successSubtitle : failureSubtitle}</Text>
          <Button
            title='Continue'
            style={{ marginTop: 'auto' }}
            onPress={this.onNext}
            theme={this.theme}
          // disabled={this.continueButtonDisabled}
          />
        </Container>
      </MasloPage>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 40,
    textAlign: 'center',
  }
});