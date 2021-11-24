import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { MasloPage, Container, Checkbox, Card, Button } from 'src/components';

import { ScenarioTriggers, PersonaStates } from '../../abstractions';
import { PushToast } from '../../toaster';
import Layout from 'src/constants/Layout';
import { PersonaViewPresets } from 'src/stateMachine/persona';
import { PersonaScrollMask } from 'src/components/PersonaScollMask';
import Images from 'src/constants/images';
import { NotificationsPreferencesViewModel } from 'src/viewModels/NotificationsPreferencesViewModel';
import { getNotificationTimeMS } from 'src/helpers/notifications';
import { NotificationsCustmizeView } from './notificationsCustomize';

@observer
export class NotificationsPreferencesView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScroll();
    }

    private readonly model = new NotificationsPreferencesViewModel();

    async start() {
        this.resetPersona(PersonaStates.Question, PersonaViewPresets.TopHalfOut);
        this.model.settingsSynced.on(this.onScheduleSynced);
    }

    state = {
        physicalDomainEnabled: new NotificationsCustmizeView(this.props).state.physicalDomainEnabled,
        leisuresDomainEnabled: new NotificationsCustmizeView(this.props).state.leisuresDomainEnabled,
        sleepDomainEnabled: new NotificationsCustmizeView(this.props).state.sleepDomainEnabled,
        includeEnabled: new NotificationsCustmizeView(this.props).state.includeEnabled,
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

    onCustomizeChange = () => {
    this.trigger(ScenarioTriggers.Primary)
    }

    renderContent() {
        const realTime = getNotificationTimeMS;
        const includeText = this.state.includeEnabled ? 'Notification that mention bipolar diagnosis' : 'N/A';
        const titleText = 'Here are your notification preferences';
        const subtitleText1 = 'Allow notifications for';
        const subtitleText2 = 'Include';
        const subtitleText3 = 'You will be notified at:';

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
                        <Text style={[this.textStyles.h3, styles.exactCard]}>{subtitleText1}</Text>
                        <Card
                            title="Physical Domain"
                            description={this.state.physicalDomainEnabled? 'On' : 'Off'}
                            style={{ marginBottom: 0, marginLeft: 3, borderColor: 'white'}}
                            Image={Images.activeArchiveIcon}
                        >
                            <Checkbox
                                checked={this.state.physicalDomainEnabled}
                                onChange={this.onNext}
                            />
                        </Card>
                        <Card
                            title="Leisure Domain"
                            description={this.state.leisuresDomainEnabled ? 'On' : 'Off'}
                            style={{ marginBottom: 0, marginLeft: 3, borderColor: 'white'}}
                            Image={Images.activeArchiveIcon}
                        >
                            <Checkbox
                                checked={this.state.leisuresDomainEnabled}
                                onChange={this.onNext}
                            />
                        </Card>
                        <Card
                            title="Sleep Domain"
                            description={this.state.sleepDomainEnabled ? 'On' : 'Off'}
                            style={{ marginBottom: 0, marginLeft: 3, borderColor: 'white'}}
                            Image={Images.activeArchiveIcon}
                        >
                            <Checkbox
                                checked={this.state.sleepDomainEnabled}
                                onChange={this.onNext}
                            />
                        </Card>
                        <Text style={[this.textStyles.h3, styles.exactCard]}>{subtitleText2}</Text>
                        <Text style={[this.textStyles.p1, styles.descrioption]}>{includeText}</Text>
                        <Text style={[this.textStyles.h3, styles.exactCard]}>{subtitleText3}</Text>
                        <Text style={[this.textStyles.p1, styles.descrioption]}>{realTime}</Text>
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
    exactCard: {
        borderLeftWidth: 20,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottomWidth: 0,
        marginBottom: 0,
        color: 'grey',
    },
    descrioption: {
        borderLeftWidth: 20,
        marginTop: 15,
        marginBottom: 30,
    },
});
