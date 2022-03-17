import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, ScrollView, Switch, Platform } from 'react-native';
import { MasloPage, Container, Card, Button } from 'src/components';
import { ScenarioTriggers, PersonaStates } from '../../abstractions';
import { PushToast } from '../../toaster';
import Layout from 'src/constants/Layout';
import { PersonaViewPresets } from 'src/stateMachine/persona';
import Images from 'src/constants/images';
import AppViewModel from 'src/viewModels';
import { iconForDomain } from 'src/helpers/DomainHelper';
import { DomainName, DomainSlug } from 'src/constants/Domain';

@observer
export class CustomizeNotificationsView extends ViewState {

    state = {
        firstDomainEnabled: false,
        secondDomainEnabled: false,
        thirdDomainEnabled: false,
        fourthDomainEnabled: false,
        fifthDomainEnabled: false,
        sixthDomainEnabled: false,
        BDMentionEnabled: false
    }

    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScroll();
    }

    get viewModel() {
        return AppViewModel.Instance.Settings.notifications;
    }

    async start() {
        this.resetPersona(PersonaStates.Question, PersonaViewPresets.TopHalfOut);
        this.viewModel.settingsSynced.on(this.onScheduleSynced);
        this.viewModel.posssibleDomains.forEach((dom, index) => {
            this.setStateForIndex(index, this.viewModel.domainsForNotifications.includes(dom));
        })
        this.setState({ BDMentionEnabled: this.viewModel.allowBDMention })
    }

    private stateForIndex(index: number): boolean {
        switch (index) {
          case 0:
            return this.state.firstDomainEnabled;
          case 1:
            return this.state.secondDomainEnabled;
          case 2:
            return this.state.thirdDomainEnabled;
          case 3:
            return this.state.fourthDomainEnabled;
          case 4:
            return this.state.fifthDomainEnabled;
          case 5:
            return this.state.sixthDomainEnabled;
          default:
            return false;
        }
      }
    
      private setStateForIndex(index: number, value: boolean) {
        switch (index) {
          case 0:
            return this.setState({ firstDomainEnabled: value });
          case 1:
            return this.setState({ secondDomainEnabled: value });
          case 2:
            return this.setState({ thirdDomainEnabled: value });
          case 3:
            return this.setState({ fourthDomainEnabled: value });
          case 4:
            return this.setState({ fifthDomainEnabled: value });
          case 5:
            return this.setState({ sixthDomainEnabled: value });
          default:
            return;
        }
      }

    componentWillUnmount() {
        this.viewModel.settingsSynced.off(this.onScheduleSynced);
    }

    onScheduleSynced = () => {
        PushToast({ text: 'Changes saved' });
    }

    onBack = () => {
        this.viewModel.domainsForNotifications = this.viewModel.posssibleDomains.filter((dom, index) => this.stateForIndex(index));
        this.viewModel.allowBDMention = this.state.BDMentionEnabled;
        this.trigger(ScenarioTriggers.Back)
    }

    renderContent() {
        const titleText = 'Customize Notifications';
        return (
            <MasloPage style={this.baseStyles.page} onBack={this.onBack} theme={this.theme}>
                <Container style={[this.baseStyles.container, { flexDirection: 'column', flex: 1, paddingTop: 60 }]}>
                    <Text style={[this.textStyles.h1, styles.title, { color: this.theme.colors.foreground }]}>{titleText}</Text>
                    {this.viewModel.posssibleDomains.map((dom, index) => {
                        return <Card
                            key={dom}
                            title={dom + ' Life Area'}
                            description={this.stateForIndex(index) ? 'On' : 'Off'}
                            style={{ marginBottom: 20 }}
                            isTransparent
                            ImageElement={iconForDomain(dom, { width: 16, height: 16 }, this.theme.colors.highlight)}
                            theme={this.theme}
                        >
                            <Switch
                                value={this.stateForIndex(index)}
                                onValueChange={(enabled) => {
                                    this.setStateForIndex(index, enabled);
                                }}
                                thumbColor={Platform.OS == 'android' && this.theme.colors.highlight}
                                trackColor={Platform.OS == 'android' && { true: this.theme.colors.highlightSecondary }}
                            />
                        </Card>
                    })}
                    <Card
                        title='Include notifications that mention bipolar diagnosis'
                        description={this.state.BDMentionEnabled ? 'On' : 'Off'}
                        style={{ marginBottom: 20, height: 100 }}
                        titleStyle={{ marginBottom: 12, color: this.theme.colors.foreground }}
                        isTransparent
                        ImageElement={iconForDomain(DomainSlug.MOOD, { width: 16, height: 16 }, this.theme.colors.highlight)}
                        theme={this.theme}
                    >
                        <Switch
                            value={this.state.BDMentionEnabled}
                            onValueChange={(val) => this.setState({ BDMentionEnabled: val })}
                            thumbColor={Platform.OS == 'android' && this.theme.colors.highlight}
                            trackColor={Platform.OS == 'android' && { true: this.theme.colors.highlightSecondary }}
                        />
                    </Card>
                </Container>
            </MasloPage >
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
    buttonView: {
        alignContent: 'center',
        alignItems: 'center',
        padding: 5
    },
});
