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
import Switch from 'dependencies/react-native-switch-pro';

import { SettingsHealthAuthViewModel } from 'src/viewModels/SettingsHealthAuthViewModel';

import Layout from 'src/constants/Layout';
import BottomBar from 'src/screens/components/BottomBar';
import { TextStyles } from 'src/styles/BaseStyles';
import { PersonaStates, PersonaViewPresets } from 'src/stateMachine/persona';
import { PersonaScrollMask } from 'src/components/PersonaScollMask';


@observer
export class HealthAuthSettingsView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScroll();
    }

    protected get unbreakable() { return false; }


    private readonly model = new SettingsHealthAuthViewModel();
    

    async start() {
        this.resetPersona(PersonaStates.Question, PersonaViewPresets.TopHalfOut);
    }

    componentWillUnmount() {
        this.model.dispose();
    }

    permissionInstruct = () => {
        this.showModal({
            title: 'Instructions',
            primaryButton: {
                text: 'Next',
                action: null,
            },
            secondaryButton: {
                text: 'Back',
                action: null,
            },
        });
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

    renderContent() {

        const healthAuthEnabled = this.model.isEnabled;

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
                        <Text style={[this.textStyles.h1, styles.title]}>Health Data</Text>
                        <Text style={[this.textStyles.p1, styles.title]}>We are collecting your health data to build a better personalized experience for you in the app</Text>
                        <View style={styles.cardsWrap}>
                        <Card
                            title="Activity"
                            description={this.model.isEnabled ? 'Authorization On' : 'Authorization Off'}
                            style={{ marginBottom: 20 }}
                        >
                            <Switch
                                value={this.model.isEnabled}
                                width={50}
                                height={24}
                                backgroundActive={Colors.switch.activeBg}
                                backgroundInactive={Colors.switch.inactiveBg}
                                style={styles.switchStyles}
                                circleStyle={{ width: 18, height: 18 }}
                            />
                        </Card>

                        <Card
                            title="Mindfuless"
                            description={this.model.isEnabled ? 'Authorization On' : 'Authorization Off'}
                            style={{ marginBottom: 20 }}

                        >
                            <Switch
                                value={this.model.isEnabled}

                                width={50}
                                height={24}
                                backgroundActive={Colors.switch.activeBg}
                                backgroundInactive={Colors.switch.inactiveBg}
                                style={styles.switchStyles}
                                circleStyle={{ width: 18, height: 18 }}
                            />
                        </Card>

                        <Card
                            title="Mobility"
                            description={this.model.isEnabled ? 'Authorization On' : 'Authorization Off'}
                            style={{ marginBottom: 20 }}
                        >
                            <Switch
                                value={this.model.isEnabled}
                                width={50}
                                height={24}
                                backgroundActive={Colors.switch.activeBg}
                                backgroundInactive={Colors.switch.inactiveBg}
                                style={styles.switchStyles}
                                circleStyle={{ width: 18, height: 18 }}
                            />
                        </Card>

                        <Card
                            title="Nutrition"
                            description={this.model.isEnabled ? 'Authorization On' : 'Authorization Off'}
                            style={{ marginBottom: 20 }}
                        >
                            <Switch
                                value={this.model.isEnabled}

                                width={50}
                                height={24}
                                backgroundActive={Colors.switch.activeBg}
                                backgroundInactive={Colors.switch.inactiveBg}
                                style={styles.switchStyles}
                                circleStyle={{ width: 18, height: 18 }}
                            />
                        </Card>

                        <Card
                            title="Respiratory"
                            description={this.model.isEnabled ? 'Authorization On' : 'Authorization Off'}
                            style={{ marginBottom: 20 }}
                        >
                            <Switch
                                value={this.model.isEnabled}
                                width={50}
                                height={24}
                                backgroundActive={Colors.switch.activeBg}
                                backgroundInactive={Colors.switch.inactiveBg}
                                style={styles.switchStyles}
                                circleStyle={{ width: 18, height: 18 }}
                            />
                        </Card>


                        <Card
                            title="Sleep"
                            description={this.model.isEnabled ? 'Authorization On' : 'Authorization Off'}
                            style={{ marginBottom: 20 }}
                        >
                            <Switch
                                value={this.model.isEnabled}
                                width={50}
                                height={24}
                                backgroundActive={Colors.switch.activeBg}
                                backgroundInactive={Colors.switch.inactiveBg}
                                style={styles.switchStyles}
                                circleStyle={{ width: 18, height: 18 }}
                            />
                        </Card>
                    
                        </View>
                        <View style={[this.baseStyles.flexCenterBottom, styles.bottomBlock]}>
                            <Button
                                title="HOW DO I CHANGE PERMISSIONS?"
                                withBorder
                                isTransparent
                                onPress={this.permissionInstruct}
                            />
                            <AppVersionView />
                            {this.renderLinksFooter()}
                        </View>
                    </Container>
                </ScrollView>
                {process.appFeatures.GOALS_ENABLED && <BottomBar screen={'settings'} />}
            </MasloPage>
        );
    }
}

function AppVersionView(this: void) {
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
    scrollView: {
        backgroundColor: 'pink',
        marginHorizontal: 20,
    },
});
