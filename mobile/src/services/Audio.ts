import { Audio, AVPlaybackStatus } from 'expo-av';
import { createLogger } from 'common/logger';

import AudioSound = Audio.Sound;

export { AudioSound, AVPlaybackStatus };

const logger = createLogger('[AudioManager]');

export type AudioModeOptions = {
    enableRecording?: boolean;
    forcePlayInSilent?: boolean;
};

const DefaultOptions: AudioModeOptions = {
    enableRecording: false,
    forcePlayInSilent: false,
};

let cache: AudioModeOptions = null;

async function initialize(options?: AudioModeOptions) {
    const opts = options || { ...DefaultOptions };
    opts.enableRecording = !!opts.enableRecording;
    opts.forcePlayInSilent = !!opts.forcePlayInSilent;

    if (
        cache != null &&
        cache.enableRecording === opts.enableRecording &&
        cache.forcePlayInSilent === opts.forcePlayInSilent
    ) {
        // options are identical
        return;
    }

    logger.log('Initializing...', opts || '<default>');
    cache = opts;

    try {
        await Audio.setAudioModeAsync({
            staysActiveInBackground: false,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
            interruptionModeAndroid:
                Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
            playsInSilentModeIOS:
                opts.forcePlayInSilent || opts.enableRecording,
            shouldDuckAndroid: true,
            allowsRecordingIOS: opts.enableRecording,
            playThroughEarpieceAndroid: opts.enableRecording,
        });
    } catch (err) {
        logger.error('Failed to initialize Audio. See error below');
        console.error(err);
    }
}

const AudioManager = {
    initialize,
};

export default AudioManager;
