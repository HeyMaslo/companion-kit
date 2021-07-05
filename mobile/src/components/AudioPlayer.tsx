import React from 'react';
import {
    StyleSheet,
    View,
    Slider,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    ViewStyle,
    StyleProp,
} from 'react-native';
import Colors from 'src/constants/colors';
import { observer } from 'mobx-react';
import AudioPlayerViewModel from 'src/viewModels/components/AudioPlayerViewModel';
import TextStyles from 'src/styles/TextStyles';
import Images from 'src/constants/images';
import Layout from 'src/constants/Layout';

interface AudioPlayerProps {
    model: AudioPlayerViewModel;
    style?: StyleProp<ViewStyle>;
    alternativeStyle?: boolean;
}

@observer
export default class AudioPlayer extends React.Component<AudioPlayerProps> {
    get model() {
        return this.props.model;
    }

    render() {
        const { alternativeStyle, style } = this.props;
        const {
            isLoaded,
            elapsed,
            duration,
            timeLeftFormated,
            progressFormated,
            onRewinding,
            isPlaying,
        } = this.model;
        const timeProgress = progressFormated || '00:00';
        const timeLeft = timeLeftFormated ? '- ' + timeLeftFormated : '00:00';

        const thumbAndActivityColor = alternativeStyle
            ? Colors.audioPlayerAltColor
            : Colors.audioPlayerThumbAndActivityColor;
        const sliderMinTrack = alternativeStyle
            ? Colors.audioPlayerAltColor
            : Colors.audioPlayerSliderMinTrack;
        const sliderMaxTrack = Colors.borderColor;

        return (
            <View style={[styles.container, style]}>
                <View
                    style={[
                        styles.sliderWrap,
                        alternativeStyle ? styles.altSlider : null,
                    ]}>
                    <Text
                        style={[
                            TextStyles.p4,
                            styles.timeProgress,
                            alternativeStyle
                                ? {
                                      ...styles.altTimeProgress,
                                      color: Colors.audioPlayerAltColor,
                                  }
                                : null,
                            !isLoaded && styles.disabled,
                        ]}>
                        {timeProgress}
                    </Text>
                    <Slider
                        style={styles.slider}
                        minimumTrackTintColor={sliderMinTrack}
                        maximumTrackTintColor={sliderMaxTrack}
                        minimumValue={0}
                        maximumValue={duration || 0}
                        thumbImage={
                            alternativeStyle
                                ? Images.altAudioThumb
                                : Images.audioThumb
                        }
                        thumbTintColor={
                            Platform.OS === 'ios' ? null : thumbAndActivityColor
                        }
                        onSlidingComplete={onRewinding}
                        disabled={!isLoaded}
                        value={elapsed || 0}
                    />
                    <Text
                        style={[
                            TextStyles.p4,
                            styles.timeLeft,
                            alternativeStyle
                                ? { color: Colors.audioPlayerAltColor }
                                : null,
                            !isLoaded && styles.disabled,
                        ]}>
                        {timeLeft}
                    </Text>
                </View>

                {!isLoaded && (
                    <ActivityIndicator
                        style={[
                            styles.controlsWrap,
                            alternativeStyle ? styles.altControls : null,
                        ]}
                        size="small"
                        color={thumbAndActivityColor}
                    />
                )}

                {/* CONTROLS ======== */}
                {isLoaded && (
                    <View
                        style={[
                            styles.controlsWrap,
                            alternativeStyle ? styles.altControls : null,
                        ]}>
                        {!isPlaying ? (
                            <TouchableOpacity
                                disabled={!isLoaded}
                                onPress={() => this.model.startPlayAsync()}
                                style={
                                    alternativeStyle ? styles.altControl : null
                                }>
                                <View
                                    style={[
                                        styles.triangle,
                                        alternativeStyle
                                            ? styles.altTriangle
                                            : null,
                                    ]}
                                />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={() => this.model.pausePlayAsync()}
                                style={[
                                    styles.rectWrap,
                                    alternativeStyle ? styles.altControl : null,
                                ]}>
                                <View
                                    style={[
                                        styles.rect,
                                        alternativeStyle
                                            ? styles.altRect
                                            : null,
                                        styles.rectLeft,
                                    ]}
                                />
                                <View
                                    style={[
                                        styles.rect,
                                        alternativeStyle
                                            ? styles.altRect
                                            : null,
                                    ]}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
    },
    sliderWrap: {
        width: '100%',
        height: 24,
        position: 'relative',
        paddingLeft: 33,
    },
    timeProgress: {
        position: 'absolute',
        bottom: -15,
        left: 34,
    },
    timeLeft: {
        position: 'absolute',
        bottom: -15,
        right: 0,
        // color: Colors.audioPlayerTimeLeft,
    },
    slider: {
        height: 24,
    },
    controlsWrap: {
        position: 'absolute',
        left: 0,
        top: 3,
    },
    triangle: {
        borderTopWidth: 18 / 2,
        borderBottomWidth: 18 / 2,
        borderLeftWidth: 20,
        borderLeftColor: Colors.audioPlayerTriangleColor,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
    },
    disabled: {
        opacity: 0.4,
    },
    rectWrap: {
        flexDirection: 'row',
        position: 'absolute',
        left: 0,
        top: 2,
        width: 30,
        height: 30,
    },
    rect: {
        width: 4,
        height: 12,
        backgroundColor: Colors.audioPlayerRectBgColor,
    },
    rectLeft: {
        marginRight: 4,
    },

    altControls: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        position: 'relative',
        top: 0,
        marginTop: Layout.isSmallDevice ? 24 : 44,
    },
    altSlider: {
        paddingLeft: 0,
    },
    altTimeProgress: {
        left: 0,
    },
    altControl: {
        width: '100%',
        height: '100%',
        top: 'auto',
        alignItems: 'center',
        justifyContent: 'center',
    },
    altTriangle: {
        borderTopWidth: 6,
        borderBottomWidth: 6,
        borderLeftWidth: 8,
        borderLeftColor: Colors.audioPlayerAltColor,
    },
    altRect: {
        backgroundColor: Colors.audioPlayerAltColor,
    },
});
