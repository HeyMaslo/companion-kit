import { ViewState } from './base';
import React from 'react';
import { NotificationRequest } from 'expo-notifications';
import { observer } from 'mobx-react';
import { StyleSheet, Text } from 'react-native';
import { MasloPage, Container, Button } from 'src/components';
import { ScenarioTriggers } from '../abstractions';
import AppController from 'src/controllers';
import { observable } from 'mobx';

@observer
export class ViewAffirmationView extends ViewState {

  private get notificationsController() {
    return AppController.Instance.User.notifications;
  }
  @observable
  private currentNotification: NotificationRequest = this.notificationsController.openedNotification;

  constructor(props) {
    super(props);
    this._contentHeight = this.persona.setupContainerHeightForceScroll();
  }

  async start() {
    this.currentNotification = this.notificationsController.openedNotification;
  }

  async end() {
    await this.notificationsController.completeOpenedNotification();
  }


  onClose = () => {
    this.trigger(ScenarioTriggers.Back);
  }

  renderContent() {
    const title = this.currentNotification ? this.currentNotification.content.title : 'Title';
    const privateBody = this.currentNotification ? this.currentNotification.content.data['privateBody'] : 'Content here';

    return (
      <MasloPage style={this.baseStyles.page} onClose={() => this.onClose()} theme={this.theme}>
        <Container style={[this.baseStyles.container, styles.container]}>
          <Text style={[this.textStyles.h1, styles.title, { color: this.theme.colors.foreground }]}>{title}</Text>
          <Text style={[this.textStyles.p1, styles.message, { color: this.theme.colors.foreground }]}>{privateBody}</Text>
        </Container>
      </MasloPage>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center',
    paddingTop: '25%',
  },
  title: {
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%',
  },
  message: {
    marginTop: 15,
    textAlign: 'center',
    width: '80%',
    marginBottom: '20%',
  }
});
