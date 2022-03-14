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
export class DailyCheckInEndView extends ViewState {

  constructor(props) {
    super(props);
    this._contentHeight = this.persona.setupContainerHeight(minContentHeight, { rotation: -15, transition: { duration: 1.5 } });
  }

  async start() {

  }

  onEndCheckIn = async () => {
    await AppViewModel.Instance.DailyCheckIn.sendDailyCheckInResults();
    this.trigger(ScenarioTriggers.Submit);
  }

  onBack = () => {
    this.trigger(ScenarioTriggers.Back);
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
    AppViewModel.Instance.DailyCheckIn.reset();
    this.trigger(ScenarioTriggers.Cancel);
  }

  renderContent() {

    return (
      <MasloPage style={this.baseStyles.page} onBack={this.onBack} onClose={() => this.onClose()} theme={this.theme}>
        <Container style={[styles.container, { height: this._contentHeight }]}>
          <Text style={[this.textStyles.h1, styles.title]}>Check-in complete</Text>
          <Text style={[this.textStyles.p1, styles.message]}>Thanks for checking in, take care today.</Text>
          <Button title='OK' style={styles.readyButton} onPress={this.onEndCheckIn} theme={this.theme} />
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
