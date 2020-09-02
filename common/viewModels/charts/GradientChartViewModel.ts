import { arrayAverage } from 'common/utils/mathx';
import { startOf, endOf, weekDays, months } from 'common/utils/dateHelpers';

const DefaultMergePeriodMs = 1000 * 3600 * 24;

export type DateFormatter = (d: Date) => string;
export type ChartPointSourceItem = { value: number, value01: number, date: number };

export type ChartPointsSource = {
    items: ChartPointSourceItem[],
    valueToColor: (v: number) => string,
    valueToTitle: (v: number) => string,
    dateToString: DateFormatter,
    mergePeriodMs?: number,
};

export type ChartPoint = {
    id?: string | number;
    value: number,
    color: string;
    title: string,
    date: string;
    extra?: boolean;
};

export type ChartData = ChartPoint[];
export type ChartDataReadonly = ReadonlyArray<ChartPoint>;

type MergeItem = { date: number, items: ChartPointSourceItem[]};

export const DateFormats = {
    Empty: (d: Date) => '',
    // DayOfWeek: (d: Date) => d.toLocaleDateString('default', { weekday: 'short' }),
    DayOfWeek: (d: Date) => {
        const dayIndex = d.getDay();
        const monthIndex = d.getMonth();

        return `${weekDays[dayIndex] || '?'}, ${d.getDate()} ${months[monthIndex] || '?'}`;
    },
    DayOfMonth: (d: Date) => d.toLocaleDateString('default', { day: '2-digit', month: 'short' }),
    Week: (d: Date) => `${DateFormats.DayOfMonth(startOf(d, 'week'))} - ${DateFormats.DayOfMonth(endOf(d, 'week'))}`,
};

export function generateChart(
    source: ChartPointsSource,
): ChartData {
    if (!source?.items?.length) {
        return [];
    }

    const mergePeriod = source.mergePeriodMs != null ? source.mergePeriodMs : DefaultMergePeriodMs;

    return merge(source.items, mergePeriod)
        .map(item => getChartPoint(item, source));
}

function merge(items: ChartPointSourceItem[], mergePeriodMs: number): ChartPointSourceItem[] {
    if (items.length <= 0) {
        return items;
    }

    const merged: MergeItem[] = [];
    const addMergeItem = (i: ChartPointSourceItem) => {
        const item: MergeItem = {
            date: i.date,
            items: [i],
        };
        merged.push(item);
        return item;
    };
    const isSameRange = (d1: number, d2: number) => {
        if (mergePeriodMs > 0) {
            const n1 = Math.trunc(d1 / mergePeriodMs);
            const n2 = Math.trunc(d2 / mergePeriodMs);
            return n1 === n2;
        }

        return false;
    };

    const sorted = items.slice().sort((a, b) => a.date - b.date);
    let current: MergeItem = null;

    sorted.forEach(i => {
        const isInRange = current && isSameRange(current.date, i.date);

        if (isInRange) {
            current.items.push(i);
        } else {
            current = addMergeItem(i);
        }
    });
    return merged.map(mi => {
        const avgValue = arrayAverage(mi.items.map(mii => mii.value || 0));
        const avgValue01 = arrayAverage(mi.items.map(mii => mii.value01 || 0));

        return <ChartPointSourceItem>({
            value: avgValue,
            value01: avgValue01,
            date: mi.date,
        });
    });
}

function getChartPoint(item: ChartPointSourceItem, source: ChartPointsSource) {
    const date = new Date(item.date);

    return <ChartPoint>({
        id: item.date,
        value: item.value01,
        color: source.valueToColor(item.value),
        date: source.dateToString(date),
        title: source.valueToTitle(item.value),
        extra: false,
    });
}
