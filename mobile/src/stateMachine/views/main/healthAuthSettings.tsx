import { ViewState } from '../base';
import React from 'react';
import ExpoConstants from 'expo-constants';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Colors from 'src/constants/colors';
import { MasloPage, Container, Button, Card, Link, Checkbox } from 'src/components';
import AppViewModel from 'src/viewModels';
import AppController from 'src/controllers';
import { ScenarioTriggers } from '../../abstractions';
import Localization from 'src/services/localization';
import Images from 'src/constants/images';

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

    
    private permissionInstruct = () => {
        this.trigger(ScenarioTriggers.Secondary);
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
                            description={this.model.isActivityEnabled ? 'Authorization On' : 'Authorization Off'}
                            style={{ marginBottom: 20, borderColor: 'black'}}
                        >
                        <Checkbox
                            checked = {this.model.isActivityEnabled}
                            onChange = {this.permissionInstruct}
                        />
                        </Card>
                        <Card
                            title="Mindfuless"
                            description={this.model.isMindfulnessEnabled ? 'Authorization On' : 'Authorization Off'}
                            style={{ marginBottom: 20, borderColor: 'black'}}

                        >
                        <Checkbox
                            checked = {this.model.isMindfulnessEnabled}
                            onChange = {this.permissionInstruct}
                        />
                        </Card>
                        <Card
                            title="Mobility"
                            description={this.model.isMobilityEnabled ? 'Authorization On' : 'Authorization Off'}
                            style={{ marginBottom: 20, borderColor: 'black'}}
                        >
                        <Checkbox
                            checked = {this.model.isMobilityEnabled}
                            onChange = {this.permissionInstruct}
                        />
                        </Card>
                        <Card
                            title="Nutrition"
                            description={this.model.isNutritionEnabled ? 'Authorization On' : 'Authorization Off'}
                            style={{ marginBottom: 20, borderColor: 'black'}}
                        >
                        <Checkbox
                            checked = {this.model.isNutritionEnabled}
                            onChange = {this.permissionInstruct}
                        />
                        </Card>
                        <Card
                            title="Respiratory"
                            description={this.model.isRespiratoryEnabled ? 'Authorization On' : 'Authorization Off'}
                            style={{ marginBottom: 20 , borderColor: 'black'}}
                        >
                        <Checkbox
                            checked = {this.model.isRespiratoryEnabled}
                            onChange = {this.permissionInstruct}
                        />
                        </Card>
                        <Card
                            title="Sleep"
                            description={this.model.isSleepEnabled ? 'Authorization On' : 'Authorization Off'}
                            style={{ marginBottom: 20, borderColor: 'black'}}
                        >
                        <Checkbox
                            checked = {this.model.isSleepEnabled }
                            onChange = {this.permissionInstruct}
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

    checkbox: {
        alignSelf: "center",
        flexDirection: "row",
        marginBottom: 20,
    }
});
