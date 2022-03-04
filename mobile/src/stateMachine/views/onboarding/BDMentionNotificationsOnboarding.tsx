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
export class BDMentionNotificationsOnboardingView extends NotificationsOnboardingBaseView {

  state = {
    BDMentionEnabled: false
  }

  async start() {
    super.start();
    this.setState({ BDMentionEnabled: this.viewModel.allowBDMention })
  }

  onBack = () => {
    this.viewModel.allowBDMention = this.state.BDMentionEnabled;
    this.trigger(ScenarioTriggers.Back)
  }

  override async onNext() {
    this.viewModel.allowBDMention = this.state.BDMentionEnabled;
    this.trigger(ScenarioTriggers.Next)
  }

  renderInnerContent(): JSX.Element {
    const titleText = 'Customize notification content';
    return (
      <>
        <Text style={[TextStyles.h1, styles.title, { color: this.theme.colors.foreground }]}>{titleText}</Text>
        <Card
          title='Include notifications that mention bipolar diagnosis'
          description={this.state.BDMentionEnabled ? 'On' : 'Off'}
          style={{ marginBottom: 20, height: 100 }}
          titleStyle={{ marginBottom: 12, color: this.theme.colors.foreground }}
          isTransparent
          ImageElement={iconForDomain(DomainName.MOOD, { width: 16, height: 16 }, this.theme.colors.highlight)}
          theme={this.theme}
        >
          <Switch
            value={this.state.BDMentionEnabled}
            disabled={this.viewModel.isToggleInProgress}
            onValueChange={(val) => this.setState({ BDMentionEnabled: val })}
            thumbColor={Platform.OS == 'android' && this.theme.colors.highlight}
            trackColor={Platform.OS == 'android' && { true: this.theme.colors.highlightSecondary }}
          />
        </Card>
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
