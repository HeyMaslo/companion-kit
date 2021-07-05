import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Permissions from 'expo-permissions';
import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';
import { observable } from 'mobx';
import * as Device from 'expo-device';
import { Camera, CameraCapturedPicture } from 'expo-camera';
import { ImageInfo } from 'expo-image-picker/build/ImagePicker.types';
import * as Links from 'src/constants/links';

const maxFileSize = 10;
const maxFileSizeToMB = maxFileSize * 1024 * 1024;
const isAndroid = Platform.OS === 'android';

export default class PictureViewViewModel {
    @observable
    private _cameraRollPermission: boolean;

    @observable
    private _cameraPermission: boolean;

    // @observable
    // private _motionPermission: boolean;

    @observable
    private _picture: CameraCapturedPicture | ImageInfo;

    @observable
    private _capturing: boolean = false;

    @observable
    private _cameraType: 'front' | 'back' = Camera.Constants.Type.back;

    // @observable
    // private _orientation: number;

    // @observable
    // private _motionSubscription: any = null;

    get cameraType() {
        return this._cameraType;
    }

    get picture() {
        return this._picture;
    }

    get capturing() {
        return this._capturing;
    }

    set capturing(v: boolean) {
        this._capturing = v;
    }

    // get orientation() {
    //     return this._orientation;
    // }

    // set orientation(v: number) {
    //     this._orientation = v;
    // }

    // get motionSubscription() {
    //     return this._motionSubscription;
    // }

    // set motionSubscription(v: any) {
    //     this._motionSubscription = v;
    // }

    get cameraRollPermission() {
        return this._cameraRollPermission;
    }

    get cameraPermission() {
        return this._cameraPermission;
    }

    // toggleMotionSubscription = async () => {
    //     // await this.askPermissions(Permissions.MOTION, this._motionPermission);
    //     const motionAvailable = await DeviceMotion.isAvailableAsync();

    //     if (motionAvailable && isAndroid) {
    //         if (this.motionSubscription) {
    //             this.unsubscribeMotion();
    //         } else {
    //             this.subscribeMotion();
    //         }
    //     }
    // }

    // subscribeMotion = () => {
    //     this.motionSubscription = DeviceMotion.addListener(motionData => {
    //         const gamma = motionData?.rotation?.gamma;
    //         const beta = motionData?.rotation?.beta;

    //         this.orientation = this.orientationCalculation(gamma, beta);
    //         console.log(this.orientation);
    //     });
    // }

    // unsubscribeMotion = () => {
    //     this.motionSubscription?.remove();
    //     this.motionSubscription = null;
    // }

    // orientationCalculation(gamma: number, beta: number): number {
    //     const ABSOLUTE_GAMMA = Math.abs(gamma);
    //     const ABSOLUTE_BETA = Math.abs(beta);
    //     const isGammaNegative = Math.sign(gamma) === -1;
    //     let orientation = 0;

    //     if (ABSOLUTE_GAMMA <= 0.04 && ABSOLUTE_BETA <= 0.24) {
    //         // Portrait mode, on a flat surface.
    //         orientation = 0;
    //     } else if (
    //         (ABSOLUTE_GAMMA <= 1.0 || ABSOLUTE_GAMMA >= 2.3) &&
    //         ABSOLUTE_BETA >= 0.5
    //     ) {
    //         // General Portrait mode, accounting for forward and back tilt on the top of the phone.
    //         orientation = 0;
    //     } else {
    //         if (isGammaNegative) {
    //             // Landscape mode with the top of the phone to the left.
    //             orientation = -90;
    //         } else {
    //             // Landscape mode with the top of the phone to the right.
    //             orientation = 90;
    //         }
    //     }

    //     return orientation;
    // }

    public askCameraRollPermissions = async () => {
        const permission = await Permissions.getAsync(Permissions.CAMERA_ROLL);
        if (permission.status !== 'granted') {
            const newPermission = await Permissions.askAsync(
                Permissions.CAMERA_ROLL,
            );
            this._cameraRollPermission = newPermission.status === 'granted';
        } else if (permission.status === 'granted') {
            this._cameraRollPermission = true;
        }
    };

    public askCameraPermissions = async () => {
        const permission = await Permissions.getAsync(Permissions.CAMERA);
        let finalStatus = permission.status;
        if (finalStatus !== 'granted') {
            const newPermission = await Permissions.askAsync(
                Permissions.CAMERA,
            );
            finalStatus = newPermission.status;
        }

        this._cameraPermission = finalStatus === 'granted';
        return this._cameraPermission;
    };

    public pickImage = async (options?: ImagePicker.ImagePickerOptions) => {
        await this.askCameraRollPermissions();

        if (!this.cameraRollPermission) {
            Alert.alert(
                'Oops',
                'Looks like camera roll access have been restricted. Please re-enable it anytime in Settings and try again.',
                [
                    { text: 'Cancel' },
                    {
                        text: 'Settings',
                        onPress: async () => {
                            const url = 'app-settings:';
                            await Links.tryOpenLink(url);
                        },
                        style: 'default',
                    },
                ],
            );
            return false;
        }

        const result = await ImagePicker.launchImageLibraryAsync(options);

        if (result.cancelled === true) {
            return false;
        }

        const fileInfo = await FileSystem.getInfoAsync(result.uri, {
            size: true,
        });
        if (!fileInfo.exists) {
            return false;
        }
        if (fileInfo.size > maxFileSizeToMB) {
            Alert.alert(
                'Sorry',
                `Unfortunately we can\'t process file more than ${maxFileSize} MB. Please crop it or compress in your OS.`,
            );
            return false;
        }

        const pic = await this.resizePic(result, true);

        return pic;
    };

    public savePicture = async (
        picture: CameraCapturedPicture,
        afterShot?: (picture: CameraCapturedPicture) => void,
    ) => {
        this._picture = await this.resizePic(picture, true);

        if (this.cameraRollPermission) {
            await MediaLibrary.createAssetAsync(this.picture.uri);
        }

        if (afterShot) {
            afterShot(this._picture);
        }
    };

    public openCameraRoll = async (
        options?: ImagePicker.ImagePickerOptions,
        afterShot?: (picture: CameraCapturedPicture) => void,
    ) => {
        const result = await this.pickImage(options);
        if (!result) {
            return;
        }

        this._picture = result;

        if (afterShot) {
            afterShot(this._picture);
        }
    };

    public toggleCameraType = () => {
        if (this.cameraType === Camera.Constants.Type.back) {
            this._cameraType = Camera.Constants.Type.front;
        } else {
            this._cameraType = Camera.Constants.Type.back;
        }
    };

    public getLastCameraRollPicture = async () => {
        await this.askCameraRollPermissions();

        if (!this.cameraRollPermission) {
            // Alert.alert('No access to the camera roll for this operation');
            return false;
        }

        if (isAndroid) {
            const totalCount = (
                await MediaLibrary.getAssetsAsync({ mediaType: ['photo'] })
            ).totalCount;

            const libRes = await MediaLibrary.getAssetsAsync({
                mediaType: ['photo'],
                first: totalCount,
                sortBy: [[MediaLibrary.SortBy.creationTime, false]],
            });

            return libRes.assets[totalCount - 1];
        }

        const libraryRes = await MediaLibrary.getAssetsAsync({
            mediaType: ['photo'],
            first: 1,
        });

        return libraryRes.assets[0];
    };

    public resizePic = async (
        picture: CameraCapturedPicture,
        fromGallery?: boolean,
    ) => {
        const uri = picture.uri;
        const picWidth = picture.width;
        const picHeight = picture.height;
        const maxSize = 1500;
        const ratio = Math.min(maxSize / picWidth, maxSize / picHeight);
        const newW = picWidth * ratio;
        const newH = picHeight * ratio;
        const exifOrientation = picture.exif?.Orientation;

        // console.log('picWidth:', picWidth, '\n picHeight:', picHeight, '\n ratio:', ratio, '\n newW:', newW, '\n newH:', newH, '\n');
        console.log('>>>>>> picture exif orientation:', exifOrientation);

        const picOpts = () => {
            if (
                // iOS
                !isAndroid ||
                // horizontal gallery photo
                (fromGallery && exifOrientation < 6) ||
                // xiaomi mi phone
                Device.deviceName === 'Mi Phone' ||
                // htc
                Device.brand === 'htc'
            ) {
                console.log('>>>>>>>exceptions<<<<<<<<');
                return [{ resize: { width: newW, height: newH } }];
            }

            return [{ resize: { width: newH, height: newW } }];
        };

        const resizedPic = await ImageManipulator.manipulateAsync(
            uri,
            picOpts(),
            { compress: 1, format: ImageManipulator.SaveFormat.JPEG },
        );

        return resizedPic;
    };

    public reset = () => {
        this._picture = null;
        this.capturing = false;
        this._cameraType = Camera.Constants.Type.back;
    };
}
