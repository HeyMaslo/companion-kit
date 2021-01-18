import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Container, MasloPage, TextInput, ButtonBlock, Button } from 'src/components';
import Colors from 'src/constants/colors';

// import { PersonaViewState } from '../../persona';
import { CheckInViewBase } from './checkInViewBase';
import { ScenarioTriggers } from '../../abstractions';
import Layout from 'src/constants/Layout';
import { PersonaStates, PersonaViewPresets } from 'src/stateMachine/persona';
import Images from 'src/constants/images';

const minContentHeight = 483;
const android = Platform.OS === 'android';

@observer
export class TextRecordView extends CheckInViewBase {
    constructor(props) {
        super(props);
        const smallHeight = this.layout.window.height < 800;
        this._contentHeight = smallHeight ? this.persona.setupContainerHeightForceScroll() : this.persona.setupContainerHeight(minContentHeight);
    }

    async start() {
        super.start();
        this.textRecordVM.isEditable = true;

        // this.savePersonaState('globalProgress', PersonaStates.Idle, this.persona.view);
        // this.persona.view = PersonaViewPresets.TopHalfOut;
    }

    get textRecordVM() {
        return this.viewModel.textRecording;
    }

    private _onSubmit = async () => {
        const valid = await this.textRecordVM.textRecord.validate();

        if (!valid) {
            return;
        }

        this.textRecordVM.isEditable = false;

        this.restorePersonaState('globalProgress');
    }

    private _onEditPress = () => {
        this.textRecordVM.isEditable = true;

        // this.savePersonaState('globalProgress', PersonaStates.Idle, this.persona.view);
        // this.persona.view = PersonaViewPresets.TopHalfOut;
    }

    tryToSubmit = async () => {
        const valid = await this.textRecordVM.textRecord.validate();

        if (valid) {
            await this.runLongOperation(this.viewModel.submitTranscription);

            await this.finishEntrySubmit();
        }
    }

    onClose = () => {
        if (this.textRecordVM.isEditable) {
            return this.delete();
        }

        return this.showModal({
            title: `Do you really want to delete this check-in entry?`,
            primaryButton: {
                text: 'yes, delete',
                action: this.cancel,
            },
            secondaryButton: {
                text: 'no, go back',
                action: () => {
                    this.hideModal();
                },
            },
        });
    }

    clearError = () => {
        this.setState({ error: '' });
    }

    delete = () => {
        if (!this.textRecordVM.textRecord.value) {
            this.trigger(ScenarioTriggers.Back);
            return;
        }

        this.showModal({
            title: 'Do you really want to delete this text?',
            primaryButton: {
                text: 'yes, delete',
                action: () => {
                    this.textRecordVM.reset();
                    this.trigger(ScenarioTriggers.Back);
                },
            },
            secondaryButton: {
                text: 'no, go back',
                action: () => {
                    this.hideModal();
                },
            },
        });
    }

    private _questionFontSize = (def, reduced) => {
        let fz = def; // default font size
        const limit = Layout.isSmallDevice ? 50 : 85; // too many characters, need to reduce font size
        const strLength = this.viewModel.question.length;

        if (strLength > limit) {
            fz = reduced;
        }

        return fz;
    }

    renderContent() {
        const { isEditable, textRecord } = this.textRecordVM;
        const { keyboard } = this.props.context;

        const editableContentPadding = this.layout.window.height - this._contentHeight;
        const editableContentHeight = keyboard?.isOpened ? keyboard?.screenY - editableContentPadding : '100%';

        return (
            <KeyboardAvoidingView behavior={android ? 'padding' : null} style={{ height: '100%' }}>
                <MasloPage
                    withDots
                    dotLength={3}
                    activeDot={2}
                    onClose={this.onClose}
                    style={!isEditable ? this.baseStyles.page : { justifyContent: 'flex-start', paddingTop: editableContentPadding }}
                >
                    <Container style={[
                        this.baseStyles.container,
                        this.baseStyles.flexBetween,
                        isEditable ? styles.content : null,
                        { height: !isEditable ? this._contentHeight : editableContentHeight },
                        ]}>
                        {!isEditable ? (
                            <View style={[this.baseStyles.textBlock, styles.textBlock]}>
                                <Text style={[
                                    this.textStyles.h1,
                                    this.baseStyles.textCenter,
                                    { fontSize: this._questionFontSize(this.textStyles.h1.fontSize, 23), lineHeight: this._questionFontSize(this.textStyles.h1.lineHeight, 27) }]}
                                >
                                    {this.viewModel.question}
                                </Text>
                            </View>
                        ) : (
                            <Text style={[
                                this.textStyles.h3, styles.editingTitle,
                                { fontSize: this._questionFontSize(this.textStyles.h3.fontSize, !this.layout.isSmallDevice ? 20 : 18), lineHeight: this._questionFontSize(this.textStyles.h3.lineHeight, !this.layout.isSmallDevice ? 23 : 21)}]}
                            >
                                {this.viewModel.question}
                            </Text>
                        )}
                        <View style={[this.baseStyles.flexStart, isEditable ? styles.inputWrap : styles.inputWrapNotEditable]}>
                            {!isEditable ?
                                <>
                                    <TouchableOpacity onPress={this._onEditPress} style={styles.editBtn} activeOpacity={0.6}>
                                        <View style={styles.editBtnWrap}>
                                            <Images.editIcon width={18} height={18}/>
                                            <Text style={[this.textStyles.labelMedium, styles.editBtnLabel]}>Edit your text</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <Text numberOfLines={3} style={[this.textStyles.p1, styles.notEditableText]}>
                                        {this.textRecordVM.textRecord.value}
                                    </Text>
                                </>
                                :
                                <>
                                    <TextInput
                                        autoFocus
                                        styleInput={[this.textStyles.p3, styles.input]}
                                        placeholder="Start typing your answer here. "
                                        model={textRecord}
                                        multiline
                                        styleError={styles.error}
                                        returnKeyType="default"
                                        skipBlurOnSubmit
                                    />
                                    <Button
                                        title="Done"
                                        onPress={this._onSubmit}
                                        style={styles.saveButton}
                                    />
                                </>
                            }
                        </View>
                        {!isEditable &&
                            <ButtonBlock
                                okTitle="save"
                                cancelTitle="delete"
                                onOk={this.tryToSubmit}
                                onCancel={this.delete}
                            />
                        }
                    </Container>
                </MasloPage>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    textBlock: {
        marginBottom: 41,
    },
    content: {
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        // borderColor: 'green',
        // borderWidth: 1,
    },
    input: {
        maxHeight: !Layout.isSmallDevice ? Layout.getViewHeight(35) : Layout.getViewHeight(30),
        minHeight: 60,
        fontSize: 16,
        textAlign: 'left',
        textAlignVertical: 'top',
        paddingTop: 0,
        flexShrink: 1,
        marginBottom: 40,
        color: Colors.inputText,
        // borderColor: 'coral',
        // borderWidth: 1,
    },
    notEditableText: {
        marginBottom: 42,
        minHeight: 78,
        lineHeight: 26,
        // borderColor: 'blue',
        // borderWidth: 1,
    },
    editBtn: {
        marginBottom: 16,
    },
    editBtnWrap: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    editBtnLabel: {
        marginLeft: 12,
        color: Colors.textRecord.editBtnLabel,
    },
    error: {
        textAlign: 'left',
        textTransform: 'uppercase',
        marginBottom: android ? 40 : null,
        marginTop: 0,
    },
    saveButton: {
        borderRadius: 5,
        width: 73,
        height: 35,
        alignSelf: 'flex-end',
        zIndex: 100,
        elevation: 100,
        flexShrink: 0,
        marginTop: 'auto',
        marginBottom: 5,
    },
    editingTitle: {
        marginBottom: 15,
    },
    inputWrap: {
        width: '100%',
        flex: 1,
        minHeight: 100,
        marginBottom: android ? 36 : null,
        // borderColor: 'yellow',
        // borderWidth: 1,
    },
    inputWrapNotEditable: {
        width: '100%',
        marginTop: 'auto',
        // borderColor: 'yellow',
        // borderWidth: 1,
    },
});
