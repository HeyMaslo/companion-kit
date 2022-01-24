import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View } from 'react-native';
import { ViewState } from '../base';
import AppController from 'src/controllers';
import { ScenarioTriggers } from '../../abstractions';
import { Button, Container, MasloPage } from 'src/components';
import TextStyles from 'src/styles/TextStyles';

@observer
export class HealthDataCollectionCheckView extends ViewState {

  async start() { }

  onNext = () => {
    this.trigger(ScenarioTriggers.Next)
  }

  renderContent() {
    return (
      <MasloPage style={this.baseStyles.page} theme={this.theme}>
        <Container style={[{ height: '100%', flexDirection: 'column', alignItems: 'center', paddingTop: 10 }]}>
          <Text style={[TextStyles.h1, styles.title, { color: this.theme.colors.foreground }]}>{'Is your device capturing all your health data?'}</Text>
          <Text style={[TextStyles.h2, styles.title, { color: this.theme.colors.foreground }]}>{'If you are using any other apps that track your mood, sleep, or other health information, make sure you have given those apps permission to send your health metrics over to Apple Health. '}</Text>
          <Button
            title='yes, continue'
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