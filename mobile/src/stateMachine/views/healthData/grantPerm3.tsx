import { ViewState } from '../base';
import React from 'react';
import ExpoConstants from 'expo-constants';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import Colors from 'src/constants/colors';
import { MasloPage, Container, Button, Card, Link,ButtonBlock,Checkbox } from 'src/components';
import AppViewModel from 'src/viewModels';
import AppController from 'src/controllers';
import { ScenarioTriggers } from '../../abstractions';
import Localization from 'src/services/localization';
import Images from 'src/constants/images';
import Dots from 'src/components/Dots';

import Layout from 'src/constants/Layout';
import { ProfileViewModel } from 'src/viewModels/ProfileViewModel';
import { PersonaScrollMask } from 'src/components/PersonaScollMask';
import BottomBar from 'src/screens/components/BottomBar';
import { TextStyles } from 'src/styles/BaseStyles';
import * as Links from 'src/constants/links';

@observer
export class GrantPermission3GfitView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScroll();
    }

    async start() {
        // this.model.notifications.init();
    }

    back = () => {
        // this.viewModel.resetFeelings();
        this.trigger(ScenarioTriggers.Back);
    }

    onClose = () => {
        Alert.alert(
            'Health Permissions',
            'Would you like to change permissions?',
            [
                { text: 'Cancel' },

                {
                    text: 'Ok',
                    onPress: async () => {
                        // this.getAuthScreens();
                        const url = 'app-settings:';
                        await Links.tryOpenLink(url);
                    },
                    style: 'default',
                },
            ]);
        this.trigger(ScenarioTriggers.Primary);
    }

    // onNext = () => {
    //     this.trigger(ScenarioTriggers.Secondary);
    // }
   

    renderContent() {

        return (
            <MasloPage style={this.baseStyles.page}>
                <Container style={styles.topBarWrapWrap}>
                    <PersonaScrollMask height={Layout.getViewHeight(24)} />
                    <View style={styles.topBarWrap}>
                        <Dots length={3} active={0} styles={{ left: 0 }} />
                        <Button style={styles.closeBtn} underlayColor="transparent" onPress={this.onClose}>
                            <Images.closeIcon width={28} height={14} />
                        </Button>
                    </View>
                </Container>
                <ScrollView style={[{ zIndex: 0, elevation: 0 }]}>
                    <Container style={[this.baseStyles.container, styles.container]}>
                        <View style={[this.baseStyles.textBlock, styles.textBlock]}>
                            <Text style={[this.textStyles.h1, this.baseStyles.textCenter]}>Allow/Disable permissions as needed</Text>
                            {/* <Text style={[this.textStyles.p1, this.baseStyles.textCenter]}>Can you tell me more about how you feel?</Text> */}
                        </View>
                        <View>
                            {/* <Images.resumeIcon width={10} height={20}/> */}
                        </View>
                        {/* <View style={[styles.feelingsWrap]}>
                            <FeelingsSelect model={feelingsMultiSelect} />
                        </View> */}
                         <Button
                            title="Go to Settings!"
                            style={styles.mailButton}
                            titleStyles={styles.mailButtonTitle}
                            onPress={this.onClose}
                            isTransparent
                             />
                        {/* <Card
                                title="Continue"
                                description=""
                                // Image={Images.veryPositiveIcon}
                                // onPress={() => this.model.toggleTime(NotificationTime.Midday)}
                                >
                                    <Images.arrowRight width={8} height={8} />
                            </Card> */}
                    </Container>
                </ScrollView> 
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        minHeight: Layout.window.height,
        paddingTop: Layout.getViewHeight(21),
    },
    feelingsWrap: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        width: '100%',
        marginBottom: 56,
    },
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
        justifyContent: 'flex-end',
        height: 50,
        zIndex: 2,
        elevation: 2,
    },
    closeBtn: {
        width: 50,
        height: 50,
        alignItems: 'flex-end',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    textBlock: {
        marginBottom: 64,
    },
    mailButtonTitle: {
        color: Colors.welcome.mailButton.title,
    },
    mailButton: {
        width: '100%',
        height: 55,
        borderColor: Colors.welcome.mailButton.border,
        // borderWidth: 0.5,
    },
    buttonView : {
        paddingTop: 20,
        // paddingLeft: 50
        
    },
});
