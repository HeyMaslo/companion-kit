import { ViewState } from '../base';
import React from 'react';
import ExpoConstants from 'expo-constants';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Colors from 'src/constants/colors';
import { MasloPage, Container, Button, Card, Link } from 'src/components';
import AppViewModel from 'src/viewModels';
import AppController from 'src/controllers';
import { ScenarioTriggers } from '../../abstractions';
import Localization from 'src/services/localization';
import Images from 'src/constants/images';

import Layout from 'src/constants/Layout';
import { ProfileViewModel } from 'src/viewModels/ProfileViewModel';
import { PersonaScrollMask } from 'src/components/PersonaScollMask';
import BottomBar from 'src/screens/components/BottomBar';
import { TextStyles } from 'src/styles/BaseStyles';

@observer
export class GetAuthInstructSettingsView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScroll();
    }

    protected get unbreakable() { return false; }

    async start() {
        this.model.notifications.init();
    }

    get model() {
        return AppViewModel.Instance.Settings;
    }

    private readonly profileVM = new ProfileViewModel();

    componentWillUnmount() {
        this.model.notifications.dispose();
    }

    goToAppleHealthSettings() {
      //pop up to the settings

    }

    private renderLinksFooter() {
      const { feedback, terms, privacy } = Localization.Current.MobileProject.links;
      return (
          <Text style={this.textStyles.p4}>
              { !!feedback ? (
                  <>
                      Send
                      <Link link={feedback}> Feedback, </Link>
                  </>
              ) : null}
              <Text style={feedback ? null : { textTransform: 'capitalize' }}>
                  read
              </Text>
              { !!terms ? (
                  <>
                      <Link link={terms}> Terms <Text style={{ textTransform: 'lowercase' }}>of</Text> Service </Link>
                      or
                  </>
              ) : (
                  <> our</>
              )}
              <Link link={privacy}> Privacy Policy</Link>
          </Text>
      );
  }

  AppVersionView(this: void) {
    const [toggle, setToggle] = React.useState(false);

    return (
        <Text style={[TextStyles.p4, styles.version]} onPress={() => setToggle(!toggle)}>
            {toggle
                ? ExpoConstants.installationId
                : AppController.Instance.version.fullVersion
            }
        </Text>
    );
}

    renderContent() {
        const authProviderIcon = this.model.authProvider === 'google'
            ? Images.googleIcon
            : Images.envelopeIcon;

        const notificationsEnabled = this.model.notifications.isEnabled && !this.model.notifications.isToggleInProgress && this.model.notifications.schedule;
        const healthAuthEnabled = this.model.healthAuth.isEnabled;
        return (
            <MasloPage style={this.baseStyles.page}>
                <Container style={styles.topBarWrapWrap}>
                    <PersonaScrollMask />
                    {!process.appFeatures.GOALS_ENABLED &&
                        <View style={styles.topBarWrap}>
                            <Button style={styles.backBtn} underlayColor="transparent" onPress={() => this.trigger(ScenarioTriggers.Back)}>
                                <Images.backIcon width={28} height={14} />
                            </Button>
                        </View>
                    }
                </Container>
                <ScrollView style={[{ zIndex: 0, elevation: 0 }]}>
                    <Container style={[this.baseStyles.container, styles.container]}>
                        <Text style={[this.textStyles.h1, styles.title]}>Instructions</Text>
                        { AppController.Instance.version.hasNext ? (
                            <Button
                                style={styles.updateButton}
                                onPress={AppController.Instance.version.update}
                            >
                                <Images.darkRefreshIcon style={styles.refreshIcon} />
                                <Text style={[this.textStyles.labelMedium, styles.updateText]}>Update Available</Text>
                            </Button>
                        ) : null}
                          <Text style={[this.textStyles.p2, styles.bottomBlock]}>Step 1</Text>
                          <Card
                                title={' Open the Apple Health App on your phone'}
                                description={null}
                                style = {{height: '8%'}}
                            >
                            </Card>
                            <Text style={[this.textStyles.p2, styles.bottomBlock]}>Step 2</Text>
                            <Card
                                title={' Next, open your personal health settings by tapping the top right corner in the app'}
                                description={null}
                                style = {{height: '10%'}}
                            >
                            </Card>
                            <Text style={[this.textStyles.p2, styles.bottomBlock]}>Step 3</Text>
                            <Card
                                title={' Select Apps under the Privacy section'}
                                description={null}
                                style = {{height: '10%'}}
                            >
                            </Card>
                            <Text style={[this.textStyles.p2, styles.bottomBlock]}>Step 4</Text>
                            <Card
                                title={' Select BB App and turn on authorization'}
                                description={' Make sure all categorise are switched on'}
                                style = {{height: '10%'}}
                            >
                            </Card>
                        <View style={[this.baseStyles.flexCenterBottom, styles.bottomBlock]}>
                            <Button
                                title="Go To Apple Health Settings"
                                withBorder
                                isTransparent
                                onPress={this.goToAppleHealthSettings}
                            />
                            <this.AppVersionView />
                            {this.renderLinksFooter()}
                        </View>
                    </Container>
                </ScrollView>
                {process.appFeatures.GOALS_ENABLED && <BottomBar screen={'settings'} />}
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
      textAlign: 'center',
      marginBottom: 40,
  },
  cardsWrap: {
      width: '100%',
      marginBottom: 40,
  },
  Card: {
    backgroundColor: 'white', 
    borderColor: 'black',
  },
  updateButton: {
      width: '100%',
      backgroundColor: Colors.settings.updateButtonBg,
      height: 40,
      borderRadius: 5,
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 16,
  },
  refreshIcon: {
      height: 20,
      width: 20,
      marginRight: 8,
  },
  updateText: {
      color: Colors.settings.updateText,
      letterSpacing: 1.6,
      // marginTop: 4,
  },
  version: {
      marginTop: 20,
      marginBottom: 4,
  },
  bottomBlock: {
      width: '100%',
      marginTop: 'auto',
      marginBottom: process.appFeatures.GOALS_ENABLED ? 90 : 0,
  },
  switchStyles: {
      paddingHorizontal: 3,
  },

  layerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
  },
  circleHolder: {
      width: 200,
      height: 200,
      justifyContent: 'center',
      alignItems: 'center'
  },
  circle: {
      backgroundColor: 'white',
      width: 150,
      height: 150,
      borderRadius: 75,
      borderWidth: 2
  },
  square: {
      backgroundColor: 'green',
      width: 200,
      height: 200,
  },
});
