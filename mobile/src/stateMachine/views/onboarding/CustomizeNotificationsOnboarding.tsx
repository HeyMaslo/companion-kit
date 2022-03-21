import { NotificationsOnboardingBaseView } from './NotificationsOnboardingBase';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, ScrollView, Switch, Platform, FlatList } from 'react-native';
import { Card } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import TextStyles from 'src/styles/TextStyles';
import { iconForDomain } from 'src/helpers/DomainHelper';
import { domainNameForSlug } from 'src/constants/Domain';

@observer
export class CustomizeNotificationsOnboardingView extends NotificationsOnboardingBaseView {

  // A maximum of 6 domains can be selected at once: 2 domains (not including 'Physical') + 4 physical subdomains
  // There are no notifications for the general 'Physical' domain, only the 4 subdomains
  state = {
    firstDomainEnabled: false,
    secondDomainEnabled: false,
    thirdDomainEnabled: false,
    fourthDomainEnabled: false,
    fifthDomainEnabled: false,
    sixthDomainEnabled: false
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
      case 3:
        return this.state.fourthDomainEnabled;
      case 4:
        return this.state.fifthDomainEnabled;
      case 5:
        return this.state.sixthDomainEnabled;
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
      case 3:
        return this.setState({ fourthDomainEnabled: value });
      case 4:
        return this.setState({ fifthDomainEnabled: value });
      case 5:
        return this.setState({ sixthDomainEnabled: value });
      default:
        return;
    }
  }

  onBack = () => {
    this.viewModel.domainsForNotifications = this.viewModel.posssibleDomains.filter((dom, index) => this.stateForIndex(index));
    this.trigger(ScenarioTriggers.Back)
  }

  override async onNext() {
    this.viewModel.domainsForNotifications = this.viewModel.posssibleDomains.filter((dom, index) => this.stateForIndex(index));
    this.trigger(ScenarioTriggers.Next)
  }

  renderListItem = ({ item }) => (
    <Card
      key={item}
      title={domainNameForSlug(item) + ' Life Area'}
      description={this.stateForIndex(this.viewModel.posssibleDomains.indexOf(item)) ? 'On' : 'Off'}
      style={{ marginBottom: 20 }}
      isTransparent
      ImageElement={iconForDomain(item, { width: 16, height: 16 }, this.theme.colors.highlight)}
      theme={this.theme}
    >
      <Switch
        value={this.stateForIndex(this.viewModel.posssibleDomains.indexOf(item))}
        onValueChange={(enabled) => {
          this.setStateForIndex(this.viewModel.posssibleDomains.indexOf(item), enabled);
        }}
        thumbColor={Platform.OS == 'android' && this.theme.colors.highlight}
        trackColor={Platform.OS == 'android' && { true: this.theme.colors.highlightSecondary }}
      />
    </Card>
  );

  renderInnerContent(): JSX.Element {
    const titleText = 'Customize target life area notifications';
    return (
      <>
        <Text style={[TextStyles.h1, styles.title, { color: this.theme.colors.foreground }]}>{titleText}</Text>
        <FlatList style={[styles.list]}
          data={this.viewModel.posssibleDomains}
          renderItem={this.renderListItem}
          keyExtractor={item => item} />
        <Text style={[TextStyles.p1, { color: this.theme.colors.foreground, textAlign: 'center', marginVertical: 15 }]}>If you turn on notifications, PolarUs will send you encouragement and tips for that life area.</Text>
      </>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 40,
    textAlign: 'center',
  },
  list: {
    marginTop: 5,
    width: '100%',
  },
});
