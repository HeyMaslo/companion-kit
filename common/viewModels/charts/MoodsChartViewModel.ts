import { Moods } from 'common/models';
import { generateChart, DateFormatter, ChartPointsSource, DateFormats } from './GradientChartViewModel';

const MoodColors = {
    [Moods.Undefined]: '#FFFFFF',
    [Moods.VeryPositive]: '#A08AE6',
    [Moods.Positive]: '#D2C3FD',
    [Moods.Mixed]: '#FFE6CF',
    [Moods.Difficult]: '#F9ADD7',
    [Moods.Rough]: '#FA8A8A',
};

export function moodToColor(mood: Moods) {
    const s = Moods.findNearest(mood);
    const res = MoodColors[s] || '#FFFFFF';
    return res;
}

export function create(
    moods: { mood: Moods, date: number }[],
    mergePeriodMs: number = 1000 * 3600 * 24,
    formatter: DateFormatter = DateFormats.DayOfWeek,
) {
    const source: ChartPointsSource = {
        items: moods.map(m => ({
            date: m.date,
            value: m.mood,
            value01: Moods.normalize(m.mood),
        })),
        mergePeriodMs: mergePeriodMs,
        dateToString: formatter,
        valueToTitle: Moods.getTitle,
        valueToColor: moodToColor,
    };

    const res = generateChart(source);
    return res;
}
