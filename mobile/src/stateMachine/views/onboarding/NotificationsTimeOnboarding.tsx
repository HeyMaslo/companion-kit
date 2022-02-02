import { NotificationsOnboardingBaseView } from './NotificationsOnboardingBase';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text } from 'react-native';
import { Button, Card } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import TextStyles from 'src/styles/TextStyles';
import DateTimePicker from 'react-native-modal-datetime-picker';

@observer
export class NotificationsTimeOnboardingView extends NotificationsOnboardingBaseView {

  state = {
    showDatePicker: false,
    hasPickedDate: false,
  };

  async start() {
    super.start();
    this.continueButtonDisabled = true;
  }

  openDatePicker = () => {
    this.setState({ showDatePicker: true });
  }

  setDate = (date: Date) => {
    if (!date) return;

    this.setState(
      { showDatePicker: false },
      () => this.viewModel.setScheduledTime({ hour: date.getHours(), minute: date.getMinutes() }),
    );
    this.setState({ hasPickedDate: true });
    this.continueButtonDisabled = false;
  }

  closeDatePicker = () => {
    this.setState({ showDatePicker: false });
  }

  onBack = () => {
    this.trigger(ScenarioTriggers.Back)
  }

  onNext = () => {
    this.trigger(ScenarioTriggers.Next)
  }

  renderInnerContent(): JSX.Element {
    const titleText = 'When would you like to be notified for check-ins?';
    const { showDatePicker, hasPickedDate } = this.state;
    return (
      <>
        <Text style={[TextStyles.h1, styles.title, { color: this.theme.colors.foreground }]}>{titleText}</Text>
        <Button title={'Pick Time'} style={[styles.title, { maxWidth: '40%' }]} theme={this.theme} onPress={() => this.setState({ showDatePicker: true })} />
        <Text style={[TextStyles.h3, styles.title, { color: this.theme.colors.foreground }]}>{'Notifications will be delivered at the same time every day. Choose a time that works for you'}</Text>
        {hasPickedDate &&
          <Text>{'You have selected ' + this.viewModel.scheduleTimeString.slice(9)}</Text>
        }
        <DateTimePicker
          isVisible={showDatePicker}
          onConfirm={this.setDate}
          onCancel={this.closeDatePicker}
          mode='time'
          isDarkModeEnabled={false} // by defulat the picker will match the user's light/dark mode; our app is lightly themed so we'll only use the light version
        />
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
