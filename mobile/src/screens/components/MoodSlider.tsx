import React from 'react';
import { StyleSheet, View, Text, Slider, Platform } from 'react-native';
import Colors from 'src/constants/colors';
import { observer } from 'mobx-react';
import MoodSliderViewModel from 'src/viewModels/components/MoodSliderViewModel';
import TextStyles, { mainFontThin } from 'src/styles/TextStyles';
import Moods from 'common/models/Moods';
import { MoodImages } from 'src/helpers/mood';
import Layout from 'src/constants/Layout';
import * as Haptics from 'src/services/haptics';

interface MoodSliderProps {
    style?: any;
    model: MoodSliderViewModel;
}

@observer
export default class MoodSlider extends React.Component<MoodSliderProps> {
    get model() {
        return this.props.model;
    }

    private _onChange = (v: number) => {
        const cm = this.model.currentMood;
        this.model.value = v;
        if (cm !== this.model.currentMood) {
            Haptics.selection();
        }
    };

    render() {
        const { style } = this.props;

        const isIos = Platform.OS === 'ios';

        const mood = this.model.currentMood;
        const title = Moods.getTitle(mood) || 'Select your mood';

        const CurrentIcon = mood
            ? MoodImages[mood]
            : MoodImages[Moods.Positive];

        if (!CurrentIcon) {
            throw new Error(
                `Mood icon was not set for the following mood: ${mood} (${title})`,
            );
        }

        const sliderValue =
            this.model.value != null
                ? this.model.value
                : this.model.minValue +
                  (this.model.maxValue - this.model.minValue) / 2;

        return (
            <View style={[styles.container, style]}>
                <View style={styles.moodWrap}>
                    <CurrentIcon
                        style={styles.moodIcon}
                        width={43}
                        height={43}
                    />
                    <Text style={[TextStyles.h2, styles.mood]}>{title}</Text>
                </View>
                <Slider
                    style={styles.slider}
                    minimumValue={this.model.minValue}
                    maximumValue={this.model.maxValue}
                    minimumTrackTintColor={Colors.borderColor}
                    maximumTrackTintColor={Colors.borderColor}
                    step={0.01}
                    thumbTintColor={Colors.moodSlider.thumbTintColor}
                    onValueChange={this._onChange}
                    value={sliderValue}
                />
                <View style={styles.sliderScale}>
                    <Text
                        style={[
                            TextStyles.p2,
                            { textTransform: 'capitalize' },
                        ]}>
                        {Moods.getTitle(Moods.Min)}
                    </Text>
                    <Text
                        style={[
                            TextStyles.p2,
                            { textTransform: 'capitalize' },
                        ]}>
                        {Moods.getTitle(Moods.Max)}
                    </Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        alignItems: 'flex-start',
        position: 'relative',
    },
    moodWrap: {
        marginBottom: 24,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    slider: {
        width: '100%',
        height: 20,
    },
    sliderScale: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    moodIcon: {
        marginBottom: 14,
    },
    mood: {
        fontFamily: mainFontThin,
        textAlign: 'center',
        textTransform: 'capitalize',
    },
});
