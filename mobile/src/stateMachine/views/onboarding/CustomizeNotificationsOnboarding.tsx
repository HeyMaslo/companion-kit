import { NotificationsOnboardingBaseView } from './NotificationsOnboardingBase';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, ScrollView, Switch, Platform } from 'react-native';
import { Card } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import TextStyles from 'src/styles/TextStyles';
import { DomainName } from 'src/constants/Domain';
import { iconForDomain } from 'src/helpers/DomainHelper';

@observer
export class CustomizeNotificationsOnboardingView extends NotificationsOnboardingBaseView {

  state = {
    firstDomainEnabled: false,
    secondDomainEnabled: false,
    thirdDomainEnabled: false,
  }

  async start() {
    super.start();
    this.viewModel.posssibleDomains.forEach((dom, index) => {
      this.setStateForIndex(index, this.viewModel.domainsForNotifications.includes(dom));
    })
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

  onBack = () => {
    this.viewModel.domainsForNotifications = this.viewModel.posssibleDomains.filter((dom, index) => this.stateForIndex(index));
    this.trigger(ScenarioTriggers.Back)
  }

  onNext = () => {
    this.viewModel.domainsForNotifications = this.viewModel.posssibleDomains.filter((dom, index) => this.stateForIndex(index));
    this.trigger(ScenarioTriggers.Next)
  }

  renderInnerContent(): JSX.Element {
    const titleText = 'Customize target life area notifications';
    return (
      <>
        <Text style={[TextStyles.h1, styles.title, { color: this.theme.colors.foreground }]}>{titleText}</Text>
        {this.viewModel.posssibleDomains.map((dom, index) => {
          return <Card
            key={dom}
            title={dom + ' Life Area'}
            description={this.stateForIndex(index) ? 'On' : 'Off'}
            style={{ marginBottom: 20 }}
            isTransparent
            ImageElement={iconForDomain(dom, { width: 16, height: 16 }, this.theme.colors.highlight)}
            theme={this.theme}
          >
            <Switch
              value={this.stateForIndex(index)}
              disabled={this.viewModel.isToggleInProgress}
              onValueChange={(enabled) => {
                this.setStateForIndex(index, enabled);
              }}
              thumbColor={Platform.OS == 'android' && this.theme.colors.highlight}
              trackColor={Platform.OS == 'android' && { true: this.theme.colors.highlightSecondary }}
            />
          </Card>
        })}
        <Text style={[TextStyles.p1, { color: this.theme.colors.foreground, textAlign: 'center' }]}>If you turn on notifications, PolarUs will send you encouragement and tips for that life area.</Text>
      </>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 40,
    textAlign: 'center',
  }
});
