import { Audio } from 'expo-av';
import * as Permissions from 'expo-permissions';
import { Platform } from 'react-native';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import { observable } from 'mobx';
import { AudioFormat } from 'common/models';
import { createLogger } from 'common/logger';
import AudioManager from 'src/services/Audio';

const RecordingOptions: Audio.RecordingOptions = {
    android: {
        ...Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY.android,
        extension: '.mp3',
        numberOfChannels: 1,
        sampleRate: 16000,
        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
    },
    ios: {
        extension: '.wav',
        // TODO(maxhawkins): test file size / recognition qualiry tradeoff
        // between using LPCM and MU-LAW. We're using LPCM but another format
        // might have better file size with little drop in accuracy.
        outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
        // TODO(maxhawkins): tinker with this setting to see if it changes
        // recognition quality. Consider sending at lower quality.
        audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
        sampleRate: 16000, // Recommended by Google
        bitRate: 128000,
        numberOfChannels: 1,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
    },
};

const logger = createLogger('[RECORDER]');

export default class Recorder {
    private _recording = new Audio.Recording();

    @observable.ref
    private _record: Audio.Sound;

    @observable
    private _uri: string;

    private _duration: number = null;

    private _status: Audio.RecordingStatus;

    static askForPermissionAsync = () =>
        Permissions.askAsync(Permissions.AUDIO_RECORDING);

    private async updateStatus() {
        this._status = await this._recording.getStatusAsync();
        return this._status;
    }

    private async setModeAsync(enable = true) {
        await AudioManager.initialize({ enableRecording: enable });

        await this.updateStatus();
    }

    public startRecordingAsync = async () => {
        try {
            await this.setModeAsync();
            await this._recording.prepareToRecordAsync(RecordingOptions);
            this._status = await this._recording.startAsync();
            activateKeepAwake();
        } catch (error) {
            await this._recording.stopAndUnloadAsync();

            alert(
                `An error occured during recording audio: ${JSON.stringify(
                    error.message,
                )} /==/ ${JSON.stringify(error)}`,
            );
            logger.warn('startRecordingAsync ERROR:', error);
            throw error;
        }
    };

    public async unloadRecord() {
        if (this._status.isRecording || this._status.isDoneRecording) {
            await this._recording.stopAndUnloadAsync();
        }
    }

    public stopRecordingAsync = async () => {
        await this.setModeAsync(false);
        await this._recording.stopAndUnloadAsync();
        const res = await this._recording.createNewLoadedSoundAsync();

        deactivateKeepAwake();
        this._duration = 0;
        if (res.status.isLoaded) {
            this._duration = (res.status.durationMillis || 0) / 1000;
        }

        this._record = res.sound;
        this._uri = this._recording.getURI();
    };

    public togglePlayingAsync = async () => {
        const status = await this._record.getStatusAsync();

        if (status.isLoaded) {
            if (status.isPlaying) {
                await this._record.pauseAsync();
                return;
            }

            if (status.positionMillis === status.durationMillis) {
                await this._record.setPositionAsync(0);
            }

            await this._record.playAsync();
        }
    };

    get record() {
        return this._record;
    }

    get uri() {
        return this._uri;
    }

    get duration() {
        return this._duration;
    }

    get encoding(): AudioFormat {
        return Platform.OS === 'ios' ? 'PCM' : 'MP3';
    }
    get sampleRate() {
        return 16000;
    }

    public clear = async () => {
        this._record = null;
    };

    public pauseAsync = async () => {
        await this._recording.pauseAsync();
        deactivateKeepAwake();
    };

    public resumeAsync = async () => {
        await this._recording.startAsync();
        activateKeepAwake();
    };

    getStatusAsync = () => this._recording.getStatusAsync();
}
