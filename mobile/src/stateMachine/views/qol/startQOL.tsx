import { ViewState } from '../base';
import React from 'react';
// import ExpoConstants from 'expo-constants';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Colors from 'src/constants/colors';
import { MasloPage, Container, Button, Card, Link } from 'src/components';
// import AppViewModel from 'src/viewModels';
// import AppController from 'src/controllers';
import { ScenarioTriggers } from '../../abstractions';
// import Localization from 'src/services/localization';
// import Images from 'src/constants/images';

import Layout from 'src/constants/Layout';
import { styles } from 'react-native-markdown-renderer';
// import { ProfileViewModel } from 'src/viewModels/ProfileViewModel';
// import { PersonaScrollMask } from 'src/components/PersonaScollMask';
// import BottomBar from 'src/screens/components/BottomBar';
// import { TextStyles } from 'src/styles/BaseStyles';

const minContentHeight = 460;

@observer
export class qolStartView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeight(minContentHeight, { rotation: -15, transition: { duration: 1.5 } });
    }

    // protected get unbreakable() { return false; }

    async start() {
        //this.model.notifications.init();
    }

    //get model() {
        // return AppViewModel.Instance.Settings;
    //}

    // private readonly profileVM = new ProfileViewModel();

    componentWillUnmount() {
        // this.model.notifications.dispose();
    }

    // logout = () => {
    //     this.showModal({
    //         title: 'Are you sure you want to log out?',
    //         primaryButton: {
    //             text: 'yes, please',
    //             action: this.model.logout,
    //         },
    //         secondaryButton: {
    //             text: 'no, I don’t',
    //             action: null,
    //         },
    //     });
    // }

    // private onPasswordChange = () => {
    //     this.trigger(ScenarioTriggers.Submit);
    // }

    // private onEmailChange = () => {
    //     // this.trigger(ScenarioTriggers.Primary);
    // }

    // private onNotificationsChange = () => {
    //     this.trigger(ScenarioTriggers.Primary);
    // }

    private cancel = () => {
        this.trigger(ScenarioTriggers.Cancel);
    }

    // private renderLinksFooter() {
    //     const { feedback, terms, privacy } = Localization.Current.MobileProject.links;
    //     return (
    //         <Text style={this.textStyles.p4}>
    //             { !!feedback ? (
    //                 <>
    //                     Send
    //                     <Link link={feedback}> Feedback, </Link>
    //                 </>
    //             ) : null}
    //             <Text style={feedback ? null : { textTransform: 'capitalize' }}>
    //                 read
    //             </Text>
    //             { !!terms ? (
    //                 <>
    //                     <Link link={terms}> Terms <Text style={{ textTransform: 'lowercase' }}>of</Text> Service </Link>
    //                     or
    //                 </>
    //             ) : (
    //                 <> our</>
    //             )}
    //             <Link link={privacy}> Privacy Policy</Link>
    //         </Text>
    //     );
    // }

    renderContent() {
        // const authProviderIcon = this.model.authProvider === 'google'
        //     ? Images.googleIcon
        //     : Images.envelopeIcon;

        // const notificationsEnabled = this.model.notifications.isEnabled && !this.model.notifications.isToggleInProgress && this.model.notifications.schedule;

        return (
            <MasloPage style={this.baseStyles.page} onClose={this.cancel}>
                <Container style={[{ height: this._contentHeight, paddingTop: 130, alignItems: 'center' }]}>
                    <Text style={[this.textStyles.h1, styles.title]}>Welcome!</Text>
                    <Text style={[this.textStyles.p1, styles.message]}>I’m happy you’re here! First, I’ll need to gather some information about your current Quality of Life. Ready to begin?</Text>
                    <Button title="I'M READY" style={styles.readyButton}/>
                </Container>
            </MasloPage>
        );
    }
}

// function AppVersionView(this: void) {
//     const [toggle, setToggle] = React.useState(false);

//     return (
//         <Text style={[TextStyles.p4, styles.version]} onPress={() => setToggle(!toggle)}>
//             {toggle
//                 ? ExpoConstants.installationId
//                 : AppController.Instance.version.fullVersion
//             }
//         </Text>
//     );
// }

const styles = StyleSheet.create({ 
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
    },
    readyButton: {
        width: '70%',
    }
});
