import React from 'react';
import { StyleSheet, TouchableOpacity, Image, View } from 'react-native';
import Layout from 'src/constants/Layout';
import { MasloPage } from 'src/components';
import { observer } from 'mobx-react';
import { CheckInViewBase } from './checkInViewBase';
import { notch } from 'src/styles/BaseStyles';

import Colors from 'src/constants/colors';
import { toJS } from 'mobx';
import { PictureView } from '../pictureView';
import { MediaTypeOptions } from 'expo-image-picker/build/ImagePicker.types';
import { ScenarioTriggers } from 'src/stateMachine/abstractions';

import SubmitArrow from 'src/assets/images/app/submit-arrow.svg';
import CloseIcon from 'src/assets/images/app/close-icon-white.png';
import BackIcon from 'src/assets/images/app/back-arrow-white.png';

@observer
export class RecordPitureCheckinView extends CheckInViewBase {
    private get pictureViewVM() {
        return this.viewModel.pictureViewVM;
    }

    async start() {
        super.start();

        this.persona.view = {
            ...this.persona.view,
            transparency: 1,
            transition: { duration: 0 },
        };
    }

    private _onBack = () => {
        if (this.pictureViewVM.picture) {
            this.showModal({
                title: 'Do you really want to delete this picture?',
                primaryButton: {
                    text: 'yes, delete',
                    action: () => {
                        this.pictureViewVM.reset();
                        this.trigger(ScenarioTriggers.Back);
                    },
                },
                secondaryButton: {
                    text: 'no, go back',
                    action: this.hideModal,
                },
            });
        } else {
            this.pictureViewVM.reset();
            this.trigger(ScenarioTriggers.Back);
        }
    };

    private _savePicture = async () => {
        await this.runLongOperation(this.viewModel.submitImage);

        await this.finishEntrySubmit();

        this.pictureViewVM.reset();
    };

    renderContent() {
        const { picture, capturing } = this.pictureViewVM;
        const pic = toJS(picture);

        return (
            <MasloPage style={this.baseStyles.page}>
                {picture && !capturing ? (
                    <>
                        <TouchableOpacity
                            onPress={this._onBack}
                            style={[this.baseStyles.back]}>
                            <Image
                                source={BackIcon}
                                style={{ width: 34, height: 24 }}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={this.onClose}
                            style={this.baseStyles.close}>
                            <Image
                                source={CloseIcon}
                                style={{ width: 22, height: 22 }}
                            />
                        </TouchableOpacity>
                        <View
                            style={[
                                this.baseStyles.flexCenter,
                                styles.capturedImageWrap,
                            ]}>
                            <Image
                                style={styles.capturedImage}
                                source={pic}
                                resizeMode={'contain'}
                            />
                            <TouchableOpacity
                                style={[
                                    this.baseStyles.flexCenter,
                                    styles.submitBtn,
                                ]}
                                onPress={this._savePicture}
                                activeOpacity={0.7}>
                                <SubmitArrow width={12} height={16} />
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <PictureView
                        model={this.pictureViewVM}
                        onClose={this.onClose}
                        pictureOptions={{
                            mediaTypes: MediaTypeOptions.Images,
                            allowsMultipleSelection: false,
                            exif: true,
                        }}
                        onBack={this._onBack}
                    />
                )}
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({
    submitBtn: {
        position: 'absolute',
        bottom: notch ? 42 : 28,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFE487',
    },
    capturedImageWrap: {
        width: Layout.getViewWidth(100),
        height: Layout.getViewHeight(100),
        backgroundColor: Colors.pageBg,
    },
    capturedImage: {
        width: Layout.getViewWidth(100),
        height: Layout.getViewHeight(100),
    },
});
