import { generateChart, DateFormatter, ChartPointsSource, DateFormats } from './GradientChartViewModel';
import { AssessmentType, IntakeForms } from 'common/models/intakeForms';

const Colors: {[K in AssessmentType]?: {[value: string]: string}} = ({
    [AssessmentType.phq9]: {
        ['None-minimal']: '#6096FF',
        ['Mild']: '#7660FF',
        ['Moderate']: '#B14EFF',
        ['Moderately Severe']: '#FC68FF',
        ['Severe']: '#FF3783',
    },
    [AssessmentType.ptsd]: {
        ['Minimal PTSD symptoms']: '#6096FF',
        ['Mild PTSD symptoms']: '#7660FF',
        ['Moderate PTSD symptoms']: '#B14EFF',
        ['Potential PTSD']: '#FF3783',
    },
    [AssessmentType.gad]: {
        ['Minimal anxiety']: '#6096FF',
        ['Mild anxiety']: '#7660FF',
        ['Moderate anxiety']: '#B14EFF',
        ['Severe anxiety']: '#FF3783',
    },
    // TODO: colors for this?
    [AssessmentType.isolated]: {
        ['No need identified']: '#6096FF',
        ['Need identified']: '#FF3783',
    },
    [AssessmentType.homeless]: {
        ['No need identified']: '#6096FF',
        ['Need identified']: '#FF3783',
    },
});

export function create(
    type: AssessmentType,
    items: { scores: number, date: number }[],
    mergePeriodMs: number = 1000 * 3600 * 24,
    formatter: DateFormatter = DateFormats.DayOfWeek,
) {
    const form = IntakeForms[type];
    const scoreToColor = (score: number) => {
        const title = form.getTitle(score);

        return Colors[type]?.[title] || '#FFFFFF';
    };

    const source: ChartPointsSource = {
        items: items.map(i => ({
            date: i.date,
            value: i.scores,
            value01: form.normalize(i.scores),
        })),
        mergePeriodMs: mergePeriodMs,
        dateToString: formatter,
        valueToTitle: form.getTitle,
        valueToColor: scoreToColor,
    };

    const res = generateChart(source);
    return res;
}
