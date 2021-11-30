import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, ScrollView, Switch } from 'react-native';
import { MasloPage, Container, Card, Button } from 'src/components';
import { ScenarioTriggers, PersonaStates } from '../../abstractions';
import { PushToast } from '../../toaster';
import Layout from 'src/constants/Layout';
import { PersonaViewPresets } from 'src/stateMachine/persona';
import { PersonaScrollMask } from 'src/components/PersonaScollMask';
import Images from 'src/constants/images';
import AppViewModel from 'src/viewModels';

@observer
export class CustomizeNotificationsOnboardingView extends ViewState {

  state = {
    firstDomainEnabled: false,
    secondDomainEnabled: false,
    thirdDomainEnabled: false,
    BDMentionEnabled: false
  }

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
    this.viewModel.posssibleDomains.forEach((dom, index) => {
      this.setStateForIndex(index, this.viewModel.domainsForNotifications.includes(dom));
    })
    this.setState({ BDMentionEnabled: this.viewModel.allowBDMention })
  }

  private stateForIndex(index: number): boolean {
    switch (index) {
      case 0:
        return this.state.firstDomainEnabled;
      case 1:
        return this.state.secondDomainEnabled;
      case 2:
        return this.state.thirdDomainEnabled;
      default:
        return false;
    }
  }

  private setStateForIndex(index: number, value: boolean) {
    switch (index) {
      case 0:
        return this.setState({ firstDomainEnabled: value });
      case 1:
        return this.setState({ secondDomainEnabled: value });
      case 2:
        return this.setState({ thirdDomainEnabled: value });
      default:
        return;
    }
  }

  componentWillUnmount() {
    this.viewModel.settingsSynced.off(this.onScheduleSynced);
  }

  onScheduleSynced = () => {
    PushToast({ text: 'Changes saved' });
  }

  onBack = () => {
    this.viewModel.domainsForNotifications = this.viewModel.posssibleDomains.filter((dom, index) => this.stateForIndex(index));
    this.viewModel.allowBDMention = this.state.BDMentionEnabled;
    this.trigger(ScenarioTriggers.Back)
  }

  onNext = () => {
    this.viewModel.domainsForNotifications = this.viewModel.posssibleDomains.filter((dom, index) => this.stateForIndex(index));
    this.viewModel.allowBDMention = this.state.BDMentionEnabled;
    this.trigger(ScenarioTriggers.Next)
  }

  renderContent() {
    const titleText = 'Customize your notifications below:';
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
            {this.viewModel.posssibleDomains.map((dom, index) => {
              return <Card
                key={dom}
                title={dom + ' Life Area'}
                description={this.stateForIndex(index) ? 'On' : 'Off'}
                style={{ marginBottom: 20, height: 100 }}
                Image={Images.bellIcon}
                theme={this.theme}
              >
                <Switch
                  value={this.stateForIndex(index)}
                  disabled={this.viewModel.isToggleInProgress}
                  onValueChange={(enabled) => {
                    this.setStateForIndex(index, enabled);
                  }}
                />
              </Card>
            })}
            <Card
              title='Include notifications that mention bipolar diagnosis'
              description={this.state.BDMentionEnabled ? 'On' : 'Off'}
              style={{ marginBottom: 20 }}
              Image={Images.bellIcon}
              theme={this.theme}
            >
              <Switch
                value={this.state.BDMentionEnabled}
                disabled={this.viewModel.isToggleInProgress}
                onValueChange={(val) => this.setState({ BDMentionEnabled: val })}
              />
            </Card>
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
});
