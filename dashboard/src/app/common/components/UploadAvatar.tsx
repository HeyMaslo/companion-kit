import React from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { validateImageExtension } from 'app/helpers/files';
import Image from './Image';
import View from './View';
import Text from './Text';
import Preloader from './Preloader';

import closeIcon from 'assets/img/close-icon.svg';

type Props = {
    currentUrl: string;
    saveAvatar: (base64: string) => Promise<void>;
};

type State = {
    crop: ReactCrop.Crop;

    original: string;
    cropped: string;
    inProgress: boolean;
    error: string;
    showError: boolean;
    errorType: string;
};

const DefaultCropOptions: ReactCrop.Crop = {
    aspect: 1,
    width: 0,
    height: 0,
};

export default class UploadAvatar extends React.Component<Props, State> {
    imageRef: HTMLImageElement;

    state: State = {
        crop: { ...DefaultCropOptions },
        original: null,
        cropped: null,
        inProgress: false,
        error: null,
        showError: false,
        errorType: null,
    };

    onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];

        if (!validateImageExtension(file)) {
            // /** TODO handle "invalid extension" error */
            // alert('Unsupported file extensions. Only PDF, GIF, JPEG allowed.');
            this.setState({ errorType: 'extension', showError: true });
            return;
        }

        if (file.size / (1024 * 1024) > 5) {
            this.setState({ errorType: 'size', showError: true });
            return;
        }

        if (file) {
            const reader = new FileReader();

            reader.addEventListener('load', () => {
                this.setState({ original: reader.result as string });
            });

            reader.readAsDataURL(file);
        }
    }

    onImageLoaded = (image: HTMLImageElement) => {
        this.imageRef = image;
    }

    onCropComplete = (crop: ReactCrop.Crop) => {
        this.makeClientCrop(this.state.crop);
    }

    onCropChange = (crop: ReactCrop.Crop, percentCrop: ReactCrop.Crop) => {
        this.setState({ crop });
    }

    makeClientCrop(crop: ReactCrop.Crop) {
        if (this.imageRef && crop.width && crop.height) {
            const croppedImage64 = this.getCroppedImg(
                this.imageRef,
                crop,
            );

            this.setState({ cropped: croppedImage64 });
        }
    }

    getCroppedImg(image: HTMLImageElement, crop: ReactCrop.Crop) {
        const canvas = document.createElement('canvas');
        const imgRect = image.getBoundingClientRect();
        const { width, height } = imgRect;
        canvas.width = crop.width;
        canvas.height = crop.height;

        const ctx = canvas.getContext('2d');

        const scaleW = image.naturalWidth / width;
        const scaleH = image.naturalHeight / height;

        ctx.drawImage(
            image,
            crop.x * scaleW,
            crop.y * scaleH,
            crop.width * scaleW,
            crop.height * scaleH,
            0,
            0,
            crop.width,
            crop.height,
        );
        const base64Image = canvas.toDataURL('image/jpeg');

        if (base64Image && canvas.width === 0 && canvas.height === 0) {
            return null;
        }

        return base64Image;
    }

    reset = () => {
        this.setState({
            crop: { ...DefaultCropOptions },
            original: null,
            cropped: null,
            errorType: null,
        });
    }

    save = async () => {
        if (this.props.saveAvatar) {
            this.setState({ inProgress: true });
            await this.props.saveAvatar(this.state.cropped || this.state.original);
            this.setState({ inProgress: false }, this.reset);
        }
    }

    render() {
        return (
            <View className="upload-avatar">
                <View className="input-block">
                    <Image className="avatar round" src={this.props.currentUrl} />

                    <input type="file" accept=".jpg, .jpeg, .png, .svg, .gif" onChange={this.onSelectFile} className="input" />
                    <View className="label-btn2">Upload</View>
                </View>

                {this.state.original && (
                    <View className="crop-modal">
                        <View className="layer" />
                        <View>
                            <ReactCrop
                                src={this.state.original}
                                crop={this.state.crop}
                                onImageLoaded={this.onImageLoaded}
                                onComplete={this.onCropComplete}
                                onChange={this.onCropChange as any}
                            />

                            {this.state.cropped && (
                                <Image alt="Crop" style={{ maxWidth: '100%' }} src={this.state.cropped} className="result" />
                            )}

                            <View className="buttons">
                                <View className="label-btn4" onClick={this.reset}>Cancel</View>
                                { this.state.inProgress
                                    ? <Preloader />
                                    : <View className="label-btn4" onClick={this.save}>Save</View>
                                }
                            </View>
                        </View>
                    </View>
                )}
                <View className={`file-error ${this.state.showError ? 'active' : ''} `}>
                    {this.state.errorType === 'size'
                        ? <Text className="tooltip-message file-error-text">The Image size should be less than 5Mb.</Text>
                        :   <>
                                <Text className="tooltip-message file-error-text">Unsupported file extension.</Text>
                                <Text className="tooltip-message file-error-text">Only png, gif, jpeg, svg are allowed.</Text>
                            </>
                        }
                    <Image onClick={() => this.setState({showError: false})} src={closeIcon} className="file-error-icon"></Image>
                </View>
            </View>
        );
    }
}