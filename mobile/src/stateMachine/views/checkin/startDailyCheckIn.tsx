import { ViewState } from '../base';
import React from 'react';
import AppViewModel from 'src/viewModels';
import { observer } from 'mobx-react';
import { StyleSheet, Text } from 'react-native';
import { MasloPage, Container, Button } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import AppController from 'src/controllers';

const minContentHeight = 460;

@observer
export class DailyCheckInStartView extends ViewState {

  constructor(props) {
    super(props);
    this._contentHeight = this.persona.setupContainerHeight(minContentHeight, { rotation: -15, transition: { duration: 1.5 } });
  }

  async start() {

  }

  public get viewModel() {
    return AppViewModel.Instance.DailyCheckIn;
  }

  private onStartCheckIn = () => {
    this.trigger(ScenarioTriggers.Submit);
  }

  private onClose = (): void | Promise<void> => this.runLongOperation(async () => {
    this.showModal({
      title: `Are you sure you want to exit your check-in?`,
      primaryButton: {
        text: 'yes',
        action: this.cancel,
      },
      secondaryButton: {
        text: 'no, go back',
        action: this.hideModal,
      },
      theme: this.theme,
    });
  })

  private cancel = () => {
    this.trigger(ScenarioTriggers.Cancel);
  }

  renderContent() {

    return (
      <MasloPage style={this.baseStyles.page} onClose={() => this.onClose()} theme={this.theme}>
        <Container style={[styles.container, { height: this._contentHeight }]}>
          <Text style={[this.textStyles.h1, styles.title]}>Hello there!</Text>
          <Text style={[this.textStyles.p1, styles.message]}>Welcome to your daily check-in! I'm going to ask you a few questions about how you're feeling today. Ready to begin?</Text>
          <Button title="I'M READY" style={styles.readyButton} onPress={() => this.onStartCheckIn()} theme={this.theme} />
        </Container>
      </MasloPage>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: '30%',
    alignItems: 'center'
  },
  title: {
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%',
  },
  message: {
    marginTop: 15,
    textAlign: 'center',
    width: '90%',
    marginBottom: '20%',
  },
  readyButton: {
    width: '70%',
  }
});
