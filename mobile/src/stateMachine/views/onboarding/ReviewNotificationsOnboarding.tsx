import { NotificationsOnboardingBaseView } from './NotificationsOnboardingBase';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { ScenarioTriggers } from '../../abstractions';
import Images from 'src/constants/images';
import TextStyles from 'src/styles/TextStyles';
import { iconForDomain } from 'src/helpers/DomainHelper';
import AppController from 'src/controllers';
import { domainNameForSlug } from 'src/constants/Domain';

@observer
export class ReviewNotificationsOnboardingView extends NotificationsOnboardingBaseView {

  onBack = null

  override async onNext() {
    // End of the onboarding flow
    await AppController.Instance.User.notifications.scheduleTwentySevenAffirmationNotifications();
    this.viewModel.completeNotificationsOnboarding()
    this.trigger(ScenarioTriggers.Next)
  }

  renderListItem = ({ item }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '85%' }}>
        {iconForDomain(item, { marginHorizontal: 20 }, this.theme.colors.highlight)}
        <Text style={this.textStyles.p2}>{domainNameForSlug(item)}</Text>
        <View style={[styles.checkbox, { borderColor: this.theme.colors.highlight, ...styles.checkboxChecked, backgroundColor: this.theme.colors.highlight, display: 'flex', marginLeft: 'auto' }]}>
          {<Images.radioChecked width={8} height={6} fill={this.theme.colors.highlight} />}
        </View>
      </View>
    </View>
  );

  renderInnerContent(): JSX.Element {
    const titleText = 'Notification Preferences';
    const contentTextStyle = [TextStyles.p1, { color: this.theme.colors.foreground }];
    return (
      <>
        <Text style={[TextStyles.h1, styles.title, { color: this.theme.colors.foreground }]}>{titleText}</Text>
        <Text style={[TextStyles.p1, { textAlign: 'center', color: this.theme.colors.midground, marginBottom: 20 }]}>You can change these at any time in settings.</Text>
        <View style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', height: '52%' }}>
          <View>
            <Text style={[contentTextStyle, { marginBottom: 10 }]}>You will recieve notifications for</Text>
            <FlatList style={{ flexGrow: 0 }}
              data={this.viewModel.domainsForNotifications}
              renderItem={this.renderListItem}
              keyExtractor={item => item} />
          </View>
          <Text style={[contentTextStyle, { alignSelf: 'flex-start' }]}>Notification time:  {this.viewModel.scheduleTimeString}</Text>
          <Text style={contentTextStyle}>You will be{!this.viewModel.allowBDMention && ' not'} sent notifications that mention bipolar.</Text>
        </View>
      </>
    );
  }
}

const checkboxSize = 24;
const styles = StyleSheet.create({
  title: {
    marginBottom: 40,
    textAlign: 'center',
  },
  checkbox: {
    height: checkboxSize,
    width: checkboxSize,
    borderRadius: checkboxSize / 2,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexShrink: 0,
  },
  checkboxChecked: {
    borderWidth: 0,
  },
  centerFlexColumn: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  }
});
