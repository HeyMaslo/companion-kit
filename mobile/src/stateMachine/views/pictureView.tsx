import React from 'react';
import { StyleSheet, TouchableOpacity, Animated, Image, View, Platform, ActivityIndicator } from 'react-native';
import { Container, MasloPage } from 'src/components';
import { observer } from 'mobx-react';
import BaseStyles from 'src/styles/BaseStyles';
import { Camera } from 'expo-camera';
import * as Haptics from 'src/services/haptics';
import { ImagePickerOptions } from 'expo-image-picker';
import PictureViewViewModel from 'src/viewModels/PictureViewViewModel';
import PhotoIcon from 'src/assets/images/app/photo-icon.svg';
import Images from 'src/constants/images';
import * as Device from 'expo-device';
import Colors from 'src/constants/colors';

import CloseIcon from 'src/assets/images/app/close-icon-white.png';
import BackIcon from 'src/assets/images/app/back-arrow-white.png';

type PictureViewProps = {
    model: PictureViewViewModel;
    onClose: () => void;
    onBack?: () => void;
    afterShot?: () => void;
    pictureOptions?: ImagePickerOptions;
};

const isAndroid = Platform.OS === 'android';

export const PictureView = observer(function (this: void, props: PictureViewProps) {
    const camera = React.useRef<Camera>();
    const unmounted = React.useRef(false);
    const [cameraReady, setCameraReady] = React.useState(false);
    const [shutterScale] = React.useState(new Animated.Value(1));
    const [cameraRollImageSrc, setCameraRollImageSrc] = React.useState(null);

    const { model, onClose, onBack, pictureOptions, afterShot } = props;
    const { cameraType, toggleCameraType, openCameraRoll } = model;

    const _capturePictureAsync = async () => {
        if (camera && !model.capturing) {
            // model.toggleMotionSubscription();

            Haptics.impact(Haptics.ImpactFeedbackStyle.Light);

            Animated.sequence([
                Animated.timing(shutterScale, {
                    toValue: 0.95,
                    duration: 100,
                    useNativeDriver: true
                }),
                Animated.timing(shutterScale, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true
                }),
                Animated.timing(shutterScale, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true
                }),
            ]).start(() => model.capturing = true);

            try {
                const pic = await camera.current.takePictureAsync({
                    exif: true,
                    skipProcessing: isAndroid,
                });
                await model.savePicture(pic, afterShot);
            } catch (err) {
                console.log('Something went wrong in _capturePictureAsync', err);
            } finally {
                model.capturing = false;
                // model.toggleMotionSubscription();
            }

        }
    };

    React.useEffect(() => {
        // model.toggleMotionSubscription();

        async function getlastPic() {
            const lastCameraRollPicture = await model.getLastCameraRollPicture();
            if (!unmounted.current) {
                setCameraRollImageSrc(lastCameraRollPicture);
            }
        }

        getlastPic();

        return () => {
            unmounted.current = true;
            // model.toggleMotionSubscription();
        };
    }, []);

    const renderCamera = Device.isDevice && model.cameraPermission;

    const InterfaceView = () => (
        <>
            <TouchableOpacity onPress={onBack} style={[BaseStyles.back]}>
                <Image source={BackIcon} style={{ width: 34, height: 24 }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={BaseStyles.close}>
                <Image source={CloseIcon} style={{ width: 22, height: 22 }} />
            </TouchableOpacity>
            <Container style={[BaseStyles.container, BaseStyles.flexRowBetween,  styles.container]}>
                <TouchableOpacity
                    style={[BaseStyles.flexCenter, styles.cameraRoll]}
                    onPress={() => openCameraRoll(pictureOptions, afterShot)}
                    activeOpacity={0.7}
                >
                    {cameraRollImageSrc ? (
                        <Image style={styles.cameraRollImage} source={cameraRollImageSrc} />
                    ) : (
                        <PhotoIcon width={28} height={28} />
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[BaseStyles.flexCenter, styles.shutter]}
                    onPress={_capturePictureAsync}
                    activeOpacity={0.7}
                >
                    <Animated.View
                        style={[
                            styles.shutterCircle,
                            { transform: [{ scale: shutterScale }] },
                        ]}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[BaseStyles.flexCenter, styles.cameraToggle]}
                    onPress={toggleCameraType}
                    activeOpacity={0.7}
                >
                    <Images.refreshIcon width={24} height={24} />
                </TouchableOpacity>
            </Container>
        </>
    );

    console.log('PICTURE ViEW RENDER ', renderCamera);

    console.log(
        '/////// Device info /////// \n',
        Device,
        '\n /////// Device info end ///////',
    );

    return (
        <MasloPage style={BaseStyles.page}>
            {renderCamera ? (
                <>
                    <View style={[styles.activityIndicator, { opacity: model.capturing ? 1 : 0 }]} pointerEvents="none">
                        <ActivityIndicator size={'large'} color={Colors.linkDefault} style={styles.activityIndicator} />
                    </View>
                    <Camera
                        ref={camera}
                        style={[BaseStyles.flexCenter, styles.cameraView]}
                        type={cameraType}
                        ratio={isAndroid ? '16:9' : null}
                        onCameraReady={() => setCameraReady(true)}
                    >
                        {cameraReady ? (
                            InterfaceView()
                        ) : null}
                    </Camera>
                </>
            ) : (
                InterfaceView()
            )}
        </MasloPage>
    );
});

const styles = StyleSheet.create({
    cameraView: {
        flex: 1,
    },
    container: {
        marginTop: 'auto',
    },
    shutter: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    shutterCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
    },
    cameraRoll: {
        width: 40,
        height: 40,
        borderRadius: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    cameraRollImage: {
        width: 40,
        height: 40,
        borderRadius: 5,
    },
    cameraToggle: {
        width: 40,
        height: 40,
        borderRadius: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityIndicator: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        elevation: 10,
        backgroundColor: Colors.pageBg,
    },
});
