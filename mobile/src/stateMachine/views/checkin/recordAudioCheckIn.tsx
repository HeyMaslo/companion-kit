import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TextStyles from 'src/styles/TextStyles';
import Colors from 'src/constants/colors';
import Layout from 'src/constants/Layout';
import { States as RecordingStates } from 'src/viewModels/RecordScreenViewModel';
import {
    Container,
    Button,
    MasloPage,
    ActivityButton,
    ButtonBlock,
    AudioPlayer,
} from 'src/components';
import { observer } from 'mobx-react';
import AppController from 'src/controllers';
import { formatMS } from 'common/utils/dateHelpers';
import { SvgProps } from 'react-native-svg';
import { CheckInViewBase } from './checkInViewBase';
import { ScenarioTriggers } from '../../abstractions';
import Images from 'src/constants/images';
import BaseStyles from 'src/styles/BaseStyles';

type ControlProps = {
    onPress: () => void;
    Icon: React.ComponentClass<SvgProps, any>;
    title: string;
};

function ControlButton(props: ControlProps) {
    const { onPress, Icon, title } = props;
    return (
        <ActivityButton
            onPress={onPress}
            loading="promise"
            style={styles.controlsButton}
            withBorder
            isTransparent>
            <Icon />
            <Text style={[TextStyles.btnTitle, styles.controlsButtonText]}>
                {title}
            </Text>
        </ActivityButton>
    );
}

const formatTime = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const minContentHeight = 483;

@observer
export class RecordView extends CheckInViewBase {
    constructor(props) {
        super(props);
        const smallHeight = this.layout.window.height < 800;
        this._contentHeight = smallHeight
            ? this.persona.setupContainerHeightForceScroll()
            : this.persona.setupContainerHeight(minContentHeight);
    }

    async start() {
        super.start();
        this.recorder.startCountdown(3);
    }

    get recorder() {
        return this.viewModel.recording;
    }

    public cancelCountdown = () => {
        this.recorder.cancelCountdown();
        this.trigger(ScenarioTriggers.Back);
    };

    tryToSubmit = async () => {
        await this.runLongOperation(this.viewModel.submit);

        await this.finishEntrySubmit();
    };

    pause = async () => {
        if (this.recorder.state === RecordingStates.recording) {
            await this.recorder.pauseAsync();
        }

        if (this.recorder.playing) {
            await this.recorder.pausePlayAsync();
        }
    };

    tryClose = async () => {
        if (this.recorder.state === RecordingStates.recording) {
            await this.pause();
        }

        if (this.recorder.state === RecordingStates.countDown) {
            // TODO pause and continue countdown
            this.recorder.cancelCountdown();
            await this.onClose();
            this.trigger(ScenarioTriggers.Back);

            return;
        }

        await this.onClose();
    };

    onDelete = async () => {
        await this.pause();

        this.showModal({
            title: 'Do you really want to delete this recording?',
            primaryButton: {
                text: 'yes, delete',
                action: async () => {
                    await this.recorder.reset();
                    this.trigger(ScenarioTriggers.Back);
                },
            },
            secondaryButton: {
                text: 'no, go back',
                action: this.hideModal,
            },
        });
    };

    getPlayProgress() {
        const { durationSec, playElapsedMS } = this.recorder;

        return playElapsedMS / (durationSec * 1000);
    }

    getPlaybackTime() {
        const { durationSec, playElapsedMS } = this.recorder;
        const diffMS = Math.max(0, durationSec * 1000 - playElapsedMS);
        const res = formatMS(diffMS);

        return '-' + res;
    }

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
        if (!AppController.Instance.isAppActive) {
            this.recorder.pauseAsync();
        }

        const formatted = (secs: number, formatMins?: boolean) => {
            const sec_num = parseInt(secs.toFixed(0), 10);
            const minutes = Math.floor(sec_num / 60);
            const seconds = sec_num - minutes * 60;

            return `${formatMins ? formatTime(minutes) : minutes}:${formatTime(
                seconds,
            )}`;
        };

        return (
            <MasloPage
                withDots
                dotLength={3}
                activeDot={2}
                onClose={this.tryClose}
                style={this.baseStyles.page}>
                <Container
                    style={[
                        this.baseStyles.container,
                        this.baseStyles.flexBetween,
                        { height: this._contentHeight },
                    ]}>
                    {/* HEADER ==== */}
                    <View style={[this.baseStyles.textBlock, styles.textBlock]}>
                        <Text
                            style={[
                                this.textStyles.h1,
                                this.baseStyles.textCenter,
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
                            {this.viewModel.question}
                        </Text>
                    </View>
                    {/* HEADER ==== */}

                    {/* CONTENT ======= */}
                    <View style={styles.content}>
                        {/* 3... 2... 1... */}
                        {this.recorder.state === RecordingStates.countDown && (
                            <View style={styles.countDown}>
                                <Text style={this.textStyles.h2}>Ready?</Text>
                                <Text
                                    style={[
                                        { ...this.textStyles.p2 },
                                        this.baseStyles.textCenter,
                                        styles.desc,
                                    ]}>
                                    {!!this.recorder.counter &&
                                        `${this.recorder.counter}...`}{' '}
                                </Text>
                            </View>
                        )}

                        {/* RECORDING */}
                        {this.recorder.active && (
                            <View style={styles.recordWrap}>
                                <Text style={this.textStyles.h2}>
                                    {formatted(this.recorder.diffSec, true)}
                                </Text>
                                <Text
                                    style={[
                                        this.textStyles.p2,
                                        this.baseStyles.textCenter,
                                        styles.desc,
                                    ]}>{`out of ${formatted(
                                    this.recorder.maxDuration,
                                )} min`}</Text>
                            </View>
                        )}

                        {/* SAVE/DELETE RECORD */}
                        {this.recorder.state === RecordingStates.finished && (
                            <AudioPlayer
                                model={this.recorder.player}
                                alternativeStyle
                                style={styles.audioPlayer}
                            />
                        )}
                    </View>
                    {/* CONTENT ======= */}

                    {/* BUTTONS PART ========= */}
                    <View style={styles.buttonsBlock}>
                        {/* CANCEL 3... 2... 1... */}
                        {this.recorder.state === RecordingStates.countDown && (
                            <Button
                                onPress={this.cancelCountdown}
                                title="Cancel"
                                withBorder
                                isTransparent
                                style={styles.cancelButton}
                            />
                        )}

                        {/* RECORDING */}
                        {this.recorder.active && (
                            <View style={styles.controls}>
                                {this.recorder.state ===
                                RecordingStates.recording ? (
                                    <ControlButton
                                        onPress={this.recorder.pauseAsync}
                                        title="PAUSE"
                                        Icon={Images.pauseIcon}
                                    />
                                ) : (
                                    <ControlButton
                                        onPress={this.recorder.resumeAsync}
                                        title="RESUME"
                                        Icon={Images.resumeIcon}
                                    />
                                )}

                                <ControlButton
                                    onPress={this.recorder.stopRecodringAsync}
                                    title="STOP"
                                    Icon={Images.stopIcon}
                                />
                            </View>
                        )}

                        {/* SAVE/DELETE RECORD */}
                        {this.recorder.state === RecordingStates.finished && (
                            <ButtonBlock
                                onOk={this.tryToSubmit}
                                onCancel={this.onDelete}
                                okTitle="Save"
                                cancelTitle="delete"
                            />
                        )}
                    </View>
                    {/* BUTTONS PART ========= */}
                </Container>
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({
    textBlock: {
        marginBottom: 36,
    },
    content: {
        width: '100%',
        height: Layout.isSmallDevice ? 144 : 184,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.record.contentBg,
        borderRadius: 5,
        marginBottom: Layout.isSmallDevice ? 24 : 48,
        marginTop: 'auto',
    },
    recordWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    cancelButton: {
        width: '100%',
    },
    countDown: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    desc: {
        marginTop: 8,
        color: Colors.record.counterTextColor,
    },
    pauseSquare: {
        height: '100%',
        width: 5,
        backgroundColor: Colors.record.pauseSquareBg,
    },
    controls: {
        width: '100%',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    controlsButton: {
        ...BaseStyles.blockButtonsWidth,
        flexDirection: 'row',
        alignItems: 'center',
    },
    controlsButtonText: {
        color: Colors.record.controlsButtonText,
        marginLeft: 8,
    },
    buttonsBlock: {
        width: '100%',
        height: 65,
    },
    audioPlayer: {
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        paddingTop: Layout.isSmallDevice ? 24 : 36,
        paddingHorizontal: 24,
    },
});
