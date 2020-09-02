import React from 'react';
import { Image, Text, View } from 'app/common/components';
import { ResilienceMeterItem } from 'common/helpers/metrics';
import Metrics from 'common/models/Metrics';

import ProjectImages from 'app/helpers/images';
import equallyIcon from 'assets/img/infograph-icon-equally.svg';

const NotEnoughDataLabel: string = 'Still gathering data';

const Colors: Record<Metrics, string[]> = {
    [Metrics.Anger]: ['#FFFFFF', '#A08AE6', '#D2C3FD', '#FFE6CF', '#F9ADD7', '#FA8A8A'],
    [Metrics.Anxiety]: ['#FFFFFF', '#A08AE6', '#FFE6CF', '#F9ADD7', '#FA8A8A'],
    get [Metrics.Depression]() { return this[Metrics.Anger]; },
    [Metrics.Energy]: null,
    [Metrics.MentalHealth]: null,
    [Metrics.Mindfulness]: null,
};

type MerticTextDistribution = { max: number, text: string };

const DefaultLabels: MerticTextDistribution[] = [
    { max: 15, text: 'Rough' },
    { max: 25, text: 'Difficult' },
    { max: 40, text: 'Mixed' },
    { max: 70, text: 'Positive' },
    { max: 100, text: 'Very positive' },
];

const MetricLabels: Record<Metrics, MerticTextDistribution[]> = {
    [Metrics.Anxiety]: [
        { max: 25, text: 'Minimal anxiety' },
        { max: 50, text: 'Mild' },
        { max: 75, text: 'Moderate anxiety' },
        { max: 100, text: 'Severe anxiety' },
    ],
    [Metrics.Anger]: [
        { max: 20, text: 'Not at all angry' },
        { max: 40, text: 'Slightly angry' },
        { max: 60, text: 'Somewhat angry' },
        { max: 80, text: 'Angry' },
        { max: 100, text: 'Extremely angry' },
    ],
    [Metrics.Depression]: [
        { max: 15, text: 'None-minimal' },
        { max: 33, text: 'Mild' },
        { max: 51, text: 'Moderate' },
        { max: 70, text: 'Moderately Severe' },
        { max: 100, text: 'Severe' },
    ],
    [Metrics.Mindfulness]: DefaultLabels,
    [Metrics.MentalHealth]: DefaultLabels,
    [Metrics.Energy]: DefaultLabels,
};

type MetricViewData = {
    text: string,
    color: string,
};

const ShiftsIcons = {
    [1]: ProjectImages.infographicCardArrowUpIcon,
    [0]: equallyIcon,
    [-1]: ProjectImages.infographicCardArrowDownIcon,
    [null as number]: ProjectImages.infographicCardNoneIcon,
};

export function getMoodData(type: Metrics, value: number): MetricViewData {
    const labels = MetricLabels[type];
    if (value == null) {
        return { text: NotEnoughDataLabel, color: Colors[type][0] };
    }

    let moodIndex = 0;
    for (; moodIndex < labels.length; ++moodIndex) {
        if (Math.trunc(value) <= labels[moodIndex].max) {
            break;
        }
    }
    const colors = Colors[type];
    const colorIndex = moodIndex + 1;
    // if value >= last max – keep moodIndex as last index
    return {
        text: labels[moodIndex].text,
        color: colors[colorIndex] || colors[0],
    };
}

type InfographicCardProps = {
    model: ResilienceMeterItem,
    className?: string;
};

export default function InfographicCard(this: void, props: InfographicCardProps) {

    const { className, model } = props;
    const { value, shift, type } = model;
    // TODO use localization if needed
    const label: string = type;
    const mood = getMoodData(type, value);
    const shiftIcon = ShiftsIcons[shift] || ShiftsIcons[null as number];

    return (
        <View className={`infographic-card ${className || ''}`}>
            <Text className="title sub-label">
                {label}
            </Text>
            <View className="mood-wrap">
                <Text className="mood title-h3 type1">
                    {mood.text}
                </Text>
                <Text className="color" style={{ background: `${mood.color}`}}/>
            </View>
            <View className="dynamics-wrap">
                <Image
                    className="icon"
                    src={shiftIcon}
                />
                <Text className="desc sub-label2">
                    {
                        shift === null
                            ? 'no data for the previous period'
                            : 'compared to the previous period'
                    }
                </Text>
            </View>
        </View>
    );
}
