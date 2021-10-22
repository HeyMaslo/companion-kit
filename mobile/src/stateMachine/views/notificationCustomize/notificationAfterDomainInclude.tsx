import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, ScrollView, Switch } from 'react-native';
import { MasloPage, Container, Card, Button } from 'src/components';

import { ScenarioTriggers, PersonaStates } from '../../abstractions';
import { PushToast } from '../../toaster';
import Layout from 'src/constants/Layout';
import { PersonaViewPresets } from 'src/stateMachine/persona';
import { PersonaScrollMask } from 'src/components/PersonaScollMask';
import Images from 'src/constants/images';
import { NotificationCustomizeViewModel } from 'src/viewModels/NotificationsCustomizeViewModel';
import { NotificationsCustmizeView } from './notificationsCustomize';

@observer
export class NotificationsAfterDomain2View extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScroll();
    }

    state = {
        includeEnabled: new NotificationsCustmizeView(this.props).state.includeEnabled,
    }
    
    private model = new NotificationCustomizeViewModel();

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

    onSave = () => {
        this.trigger(ScenarioTriggers.Primary)
    }
    renderContent() {
        const titleText = 'You can customize what notifications you receive below:';
        const descriptionPrivacyAppDescription = 'Polarus understands that you may not want to receive notifications about your bipolar diagnosis for privacy reasons';

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
                            title="Include notifications that  mention bipolar diagnosis"
                            description={this.state.includeEnabled ? 'On' : 'Off'}
                            style={{ marginBottom: 20, height: 100}}
                            Image={Images.bellIcon}
                        >
                            <Switch
                                value={this.state.includeEnabled}
                                disabled={this.model.isToggleInProgress}
                                onValueChange={(includeEnabled) => this.setState({includeEnabled})}
                            />
                        </Card>
                        <Text style={[this.textStyles.p1, styles.description]}>{descriptionPrivacyAppDescription}</Text>
                        <View style={styles.buttonView}>
                        <Button
                            title="How Do I change preferences later"
                            style={[styles.insturctionsButton, this.textStyles.h2]}
                            titleStyles={styles.insturctionsButtonTitle}
                            onPress={this.onSave}
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
        width: '90%',
        height: 50,
        borderColor: '#595959',
        borderWidth: 0.25,
        backgroundColor: '#595959',
        padding: 5
    },
    insturctionsButtonTitle: {
        color: 'white'
    },
    description: {
        textAlign: 'center',
        color: 'grey',
        marginBottom: 30,
        borderColor: 'transparent',
        borderWidth: 40
    }
});
