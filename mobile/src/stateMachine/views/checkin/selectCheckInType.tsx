import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Alert,
    Linking,
} from 'react-native';
import { PersonaStates, ScenarioTriggers } from '../../abstractions';
import Colors from 'src/constants/colors';
import { MasloPage, Button, Container } from 'src/components';
import { observer } from 'mobx-react';
import Recorder from 'src/components/common/Recorder';
import { CheckInViewBase } from './checkInViewBase';
import Images from 'src/constants/images';
import Layout from 'src/constants/Layout';

import PhotoIcon from 'src/assets/images/app/photo-icon.svg';
import TextStyles from 'src/styles/TextStyles';
import { ModalButton } from '../modalView';

const RefreshIcon = Images.refreshIcon;

const minContentHeight = 550;

const PICTURE_CHECKIN_ENABLED = process.appFeatures.PICTURE_CHECKINS_ENABLED;

@observer
export class CheckInTypeView extends CheckInViewBase {
    constructor(props) {
        super(props);
        const smallHeight = this.layout.window.height < 800;
        this._contentHeight = smallHeight
            ? this.persona.setupContainerHeightForceScroll({ rotation: 405 })
            : this.persona.setupContainerHeight(minContentHeight, {
                  rotation: 405,
              });
    }

    async start() {
        super.start();
        this.persona.state = PersonaStates.Tap;
    }

    private _goToRecord = async () => {
        const res = await Recorder.askForPermissionAsync();

        if (res.status === 'granted') {
            this.trigger(ScenarioTriggers.Primary);
        } else {
            Alert.alert(
                'Permission Error',
                'Looks like you have denied microphone permission request. If you changed your mind, please update OS settings for the app.',
            );
        }
    };
    private _goToText = () => {
        this.viewModel.keepQuestion();
        this.trigger(ScenarioTriggers.Secondary);
    };

    private _goToPicture = async () => {
        const hasPermission = await this.viewModel.pictureViewVM.askCameraPermissions();
        if (hasPermission) {
            this.trigger(ScenarioTriggers.Submit);
        } else {
            await this._noCameraPermission();
        }
    };

    private _noCameraPermission = async () => {
        const url = 'app-settings:';
        const settingsSupported = await Linking.canOpenURL(url);

        const okButton: ModalButton = {
            text: 'OK',
            action: () => {
                this.hideModal();
                this.trigger(ScenarioTriggers.Submit);
            },
        };

        this.showModal({
            title: 'Сamera access required',
            message: (
                <View style={styles.modalMessageView}>
                    <Text
                        style={[
                            Layout.isSmallDevice
                                ? TextStyles.p2
                                : TextStyles.p1,
                            styles.modalMessageText,
                        ]}>
                        Please re-enable it anytime in Settings and try again
                    </Text>
                </View>
            ),
            primaryButton: settingsSupported
                ? {
                      text: 'Settings',
                      action: async () => {
                          this.hideModal();
                          Linking.openURL(url);
                      },
                  }
                : okButton,
            secondaryButton: settingsSupported ? okButton : null,
        });
    };

    private _onGoBack = () => {
        this.viewModel.keepQuestion();
        this.trigger(ScenarioTriggers.Back);
    };

    private _questionFontSize = (def, reduced) => {
        let fz = def; // default font size
        const limit = Layout.isSmallDevice ? 50 : 85; // too many characters, need to reduce font size
        const strLength = this.viewModel.question.length;

        if (strLength > limit) {
            fz = reduced;
        }

        return fz;
    };

    renderContent() {
        const { viewModel } = this;

        return (
            <MasloPage
                withDots
                dotLength={3}
                activeDot={2}
                onClose={this.onClose}
                style={this.baseStyles.page}>
                <Container
                    style={[
                        this.baseStyles.container,
                        this.baseStyles.flexBetween,
                        { height: this._contentHeight },
                    ]}>
                    <View style={[this.baseStyles.textBlock, styles.textBlock]}>
                        <Text
                            style={[
                                this.textStyles.h1,
                                styles.desc,
                                {
                                    fontSize: this._questionFontSize(
                                        this.textStyles.h1.fontSize,
                                        this.layout.isSmallDevice ? 20 : 23,
                                    ),
                                    lineHeight: this._questionFontSize(
                                        this.textStyles.h1.lineHeight,
                                        27,
                                    ),
                                },
                            ]}>
                            {viewModel.question}
                        </Text>
                        {viewModel.canRollQuestions && (
                            <TouchableOpacity
                                onPress={viewModel.rollQuestion}
                                style={styles.refresh}>
                                <RefreshIcon height={20} width={20} />
                                <Text
                                    style={[
                                        this.textStyles.labelMedium,
                                        styles.refreshText,
                                    ]}>
                                    Next Prompt
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.content}>
                        <Text
                            style={[
                                this.textStyles.labelMedium,
                                styles.heading,
                            ]}>
                            How do you want to share?
                        </Text>
                        <View style={styles.mainButtons}>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={this._goToText}>
                                <Images.textRecordIcon style={styles.icon} />
                                <Text
                                    style={[
                                        this.textStyles.labelMedium,
                                        styles.btnTitle,
                                    ]}>
                                    Write
                                </Text>
                            </TouchableOpacity>
                            <View style={styles.separator} />
                            <TouchableOpacity
                                style={styles.button}
                                onPress={this._goToRecord}>
                                <Images.recordIcon style={styles.icon} />
                                <Text
                                    style={[
                                        this.textStyles.labelMedium,
                                        styles.btnTitle,
                                    ]}>
                                    Record
                                </Text>
                            </TouchableOpacity>
                            {PICTURE_CHECKIN_ENABLED && (
                                <>
                                    <View style={styles.separator} />
                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={this._goToPicture}>
                                        <PhotoIcon style={styles.icon} />
                                        <Text
                                            style={[
                                                this.textStyles.labelMedium,
                                                styles.btnTitle,
                                            ]}>
                                            Photo
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                        <Button
                            onPress={this._onGoBack}
                            title="Cancel"
                            isTransparent
                            withBorder
                        />
                    </View>
                </Container>
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({
    textBlock: {
        marginBottom: 22,
    },
    desc: {
        width: '100%',
        textAlign: 'center',
    },
    heading: {
        textAlign: 'center',
        marginBottom: 32,
        marginTop: 22,
    },
    content: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnTitle: {
        color: Colors.journalType.btnTitle,
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    separator: {
        height: 59,
        width: 1,
        backgroundColor: Colors.borderColor,
        marginHorizontal: PICTURE_CHECKIN_ENABLED ? 30 : 40,
    },
    refresh: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.journalType.nextPromptBg,
        width: 159,
        height: 40,
        marginTop: 22,
        borderRadius: 8,
    },
    refreshText: {
        color: Colors.journalType.nextPromptText,
        textTransform: 'uppercase',
        marginLeft: 12,
    },
    icon: {
        height: 33,
        width: 33,
        marginBottom: 11,
    },
    mainButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginBottom: 56,
    },
    modalMessageView: {
        marginTop: 22,
    },
    modalMessageText: {
        textAlign: 'center',
    },
});
