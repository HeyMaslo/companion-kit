import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, ScrollView, Switch } from 'react-native';
import { MasloPage, Container, Card, Button } from 'src/components';
import Colors from 'src/constants/colors';
import { ScenarioTriggers, PersonaStates } from '../../abstractions';
import { PushToast } from '../../toaster';
import Layout from 'src/constants/Layout';
import { PersonaViewPresets } from 'src/stateMachine/persona';
import { PersonaScrollMask } from 'src/components/PersonaScollMask';
import Images from 'src/constants/images';
import AppViewModel from 'src/viewModels';

@observer
export class ReviewNotificationsOnboarding extends ViewState {

  constructor(props) {
    super(props);
    this._contentHeight = this.persona.setupContainerHeightForceScroll();
  }

  get viewModel() {
    return AppViewModel.Instance.Settings.notifications;
  }

  async start() {
    this.resetPersona(PersonaStates.Question, PersonaViewPresets.TopHalfOut);
    this.viewModel.settingsSynced.on(this.onScheduleSynced);
  }

  componentWillUnmount() {
    this.viewModel.settingsSynced.off(this.onScheduleSynced);
  }

  onScheduleSynced = () => {
    PushToast({ text: 'Changes saved' });
  }

  onBack = () => {
    this.trigger(ScenarioTriggers.Back)
  }

  onNext = () => {
    this.trigger(ScenarioTriggers.Next)
  }

  renderContent() {
    const titleText = 'Notification preferences';
    return (
      <MasloPage style={this.baseStyles.page} theme={this.theme}>
        <Container style={styles.topBarWrapWrap}>
          <PersonaScrollMask />
          <View style={styles.topBarWrap}>
            <Button style={styles.backBtn} underlayColor='transparent' onPress={() => this.onBack()} theme={this.theme}>
              <Images.backIcon width={28} height={14} />
            </Button>
          </View>
        </Container>
        <ScrollView style={[{ zIndex: 0, elevation: 0 }]}>
          <Container style={[this.baseStyles.container, styles.container]}>
            <Text style={[this.textStyles.h1, styles.title]}>{titleText}</Text>
            <Text>You can change these at any time in settings.</Text>
            <View style={styles.buttonView}>
              <Button
                title='Continue'
                onPress={this.onNext}
                isTransparent
                theme={this.theme}
              />
            </View>
          </Container>
        </ScrollView>
      </MasloPage>
    );
  }
}

const styles = StyleSheet.create({
  topBarWrapWrap: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 2,
    elevation: 2,
  },
  topBarWrap: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 72,
    zIndex: 2,
    elevation: 2,
  },
  backBtn: {
    width: 52,
    height: 52,
    alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  container: {
    minHeight: Layout.window.height,
    paddingTop: Layout.getViewHeight(21),
  },
  title: {
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonView: {
    alignContent: 'center',
    alignItems: 'center',
    padding: 5
  },
  insturctionsButton: {
    width: '80%',
    height: 50,
    borderColor: 'grey',
    borderWidth: 0.25,
    backgroundColor: 'white',
    padding: 5
  },
  insturctionsButtonTitle: {
    color: Colors.welcome.mailButton.title,
  },
});
