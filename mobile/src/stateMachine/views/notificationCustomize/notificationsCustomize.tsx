import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, ScrollView, Switch } from 'react-native';
import { MasloPage, Container, Card, Button } from 'src/components';
import Colors from 'src/constants/colors';

import { ScenarioTriggers, PersonaStates } from '../../abstractions';
import { PushToast } from '../../toaster';
import Layout from 'src/constants/Layout';
import { PersonaViewPresets } from 'src/stateMachine/persona';
import { PersonaScrollMask } from 'src/components/PersonaScollMask';
import Images from 'src/constants/images';
import { NotificationCustomizeViewModel } from 'src/viewModels/NotificationsCustomizeViewModel';

@observer
export class NotificationsCustmizeView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScroll();
    }
    state = {
        physicalDomainEnabled: false, 
        leisuresDomainEnabled: false, 
        sleepDomainEnabled: false, 
        includeEnabled:false
    }

    private readonly model = new NotificationCustomizeViewModel();

    protected get unbreakable() { return false; }

    async start() {
        this.resetPersona(PersonaStates.Question, PersonaViewPresets.TopHalfOut);
        this.model.settingsSynced.on(this.onScheduleSynced);
    }

    componentWillUnmount() {
        this.model.settingsSynced.off(this.onScheduleSynced);
    }

    onScheduleSynced = () => {
        PushToast({ text: 'Changes saved' });
    }

    onNext = () => {
        this.trigger(ScenarioTriggers.Primary)
   }

    renderContent() {
        const titleText = 'Customize your notifications below:';
        return (
            <MasloPage style={this.baseStyles.page}>
                <Container style={styles.topBarWrapWrap}>
                    <PersonaScrollMask />
                    <View style={styles.topBarWrap}>
                        <Button style={styles.backBtn} underlayColor='transparent' onPress={() => this.trigger(ScenarioTriggers.Back)}>
                            <Images.backIcon width={28} height={14} />
                        </Button>
                    </View>
                </Container>
                <ScrollView style={[{ zIndex: 0, elevation: 0 }]}>
                    <Container style={[this.baseStyles.container, styles.container]}>
                        <Text style={[this.textStyles.h1, styles.title]}>{titleText}</Text>
                        <Card
                            title="Physical Domain"
                            description={this.state.physicalDomainEnabled ? 'On' : 'Off'}
                            style={{ marginBottom: 20 }}
                            Image={Images.bellIcon}
                        >
                            <Switch
                                value={this.state.physicalDomainEnabled}
                                disabled={this.model.isToggleInProgress}
                                onValueChange={(physicalDomainEnabled) => this.setState({physicalDomainEnabled})}
                            />
                        </Card>

                        <Card
                            title="Leisure Domain"
                            description={this.state.leisuresDomainEnabled ? 'On' : 'Off'}
                            style={{ marginBottom: 20 }}
                            Image={Images.bellIcon}
                        >
                            <Switch
                                value={this.state.leisuresDomainEnabled}
                                disabled={this.model.isToggleInProgress}
                                onValueChange={(leisuresDomainEnabled) => this.setState({leisuresDomainEnabled})}
                            />
                        </Card>

                        <Card
                            title="Sleep Domain"
                            description={this.state.sleepDomainEnabled ? 'On' : 'Off'}
                            style={{ marginBottom: 20 }}
                            Image={Images.bellIcon}
                        >
                            <Switch
                                value={this.state.sleepDomainEnabled}
                                disabled={this.model.isToggleInProgress}
                                onValueChange={(sleepDomainEnabled) => this.setState({sleepDomainEnabled})}
                            />
                        </Card>
                        <Card
                            title="Include notifications that  mention bipolar diagnosis"
                            description={this.state.includeEnabled ? 'On' : 'Off'}
                            style={{ marginBottom: 20, height: 100 }}
                            Image={Images.bellIcon}
                        >
                            <Switch
                                value={this.state.includeEnabled}
                                disabled={this.model.isToggleInProgress}
                                onValueChange={(includeEnabled) => this.setState({includeEnabled})}
                            />
                        </Card>
                        <View style={styles.buttonView}>
                        <Button
                            title="SAVE"
                            style={[styles.insturctionsButton, this.textStyles.h2]}
                            titleStyles={styles.insturctionsButtonTitle}
                            onPress={this.onNext}
                            isTransparent
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
    buttonView : {
        alignContent: 'center',
        alignItems: 'center',
        padding: 5
     },
    insturctionsButton: {
        width: '80%',
        height: 50,
        borderColor: 'grey',
        borderWidth: 0.25,
        backgroundColor: 'white',
        padding: 5
    },
    insturctionsButtonTitle: {
        color: Colors.welcome.mailButton.title,
    },
});
