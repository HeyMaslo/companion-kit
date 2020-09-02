import {
    ClientIntakeFormIded,
    RecordDataIded,
    AssessmentType,
    ClientJournalEntryIded,
    IntakeForms,
} from 'common/models';
import { clamp01 } from 'common/utils/mathx';
import { Metrics } from 'common/models/Metrics';

type Resilience = { [K in Metrics]?: number };

type PeriodData<T> = {
    current: T,
    previous: T,
};

export type ResilienceMeterItem = {
    value: number,
    shift: number,
    type: Metrics,
};

function getEmptyMetricValue(type: Metrics): ResilienceMeterItem {
    return {
        type,
        value: null,
        shift: null,
    };
}

export type MetricsSourceData = {
    records: ReadonlyArray<RecordDataIded>,
    forms?: Partial<Record<AssessmentType, ReadonlyArray<ClientIntakeFormIded>>>,
    journals?: ReadonlyArray<ClientJournalEntryIded>,
};

function compareResilience(current: Resilience, previous: Resilience, field: keyof Resilience): number {
    if (!current || !previous || !current[field] || !previous[field]) {
        return null;
    }
    const curr = current[field];
    const prev = previous[field];
    const diff = curr - prev;

    if (Math.abs(diff) < 0.01 ) {
        return 0;
    } else if (curr > prev) {
        return 1;
    }

    return -1;
}

export function splitItemsByPeriod<T extends { date?: number }>(
    items: ReadonlyArray<T>, start: number, end: number,
    previousStart: number = null, previousEnd: number = null,
    allowIntersect = false,
): PeriodData<T[]> {
    const current: T[] = [];
    const previous: T[] = [];

    const p = end - start;
    const pStart = previousStart || (start - p);
    const pEnd = previousEnd || start;

    items?.forEach(i => {
        if (i.date >= start && i.date <= end) {
            current.push(i);

            if (!allowIntersect) {
                return;
            }
        }

        // allow items to go into both ranges
        if (i.date >= pStart && i.date <= pEnd) {
            previous.push(i);
        }
    });

    return {
        current,
        previous,
    };
}

function getSplittedData(data: MetricsSourceData, startTime: number, endTime: number) {
    const recordsSplitted = splitItemsByPeriod(data.records, startTime, endTime);
    const result: PeriodData<MetricsSourceData> = {
        current: { records: recordsSplitted.current },
        previous: { records: recordsSplitted.previous },
    };

    if (data.journals) {
        const journalsSplitted = splitItemsByPeriod(data.journals, startTime, endTime);

        result.current.journals = journalsSplitted.current;
        result.previous.journals = journalsSplitted.previous;
    }

    if (data.forms) {
        result.current.forms = { };
        result.previous.forms = { };

        Object.keys(data.forms).forEach((type: AssessmentType) => {
            const items = data.forms[type];
            const expTime = IntakeForms[type]?.ExpirationTimeMs || 0;

            const p = endTime - startTime;
            const pStart = startTime - p - expTime;
            const pEnd = startTime;

            const splitted = splitItemsByPeriod(items,
                startTime - expTime, endTime,
                pStart, pEnd,
                true,
            );

            result.current.forms[type] = splitted.current;
            result.previous.forms[type] = splitted.previous;
        });
    }

    return result;
}

const getMeter = (metric: Metrics, data: MetricsSourceData) => {
    let result = 0;

    switch (metric) {
        case Metrics.Mindfulness:
            result = Metrics.getMindfulness(data.records);
            break;
        case Metrics.MentalHealth:
            result = Metrics.getMentalHealth(data.records);
            break;
        case Metrics.Energy:
            result = Metrics.getEnergy(data.records);
            break;
        case Metrics.Anxiety:
            result = Metrics.getAnxiety(data.records);
            break;
        case Metrics.Depression:
            result = Metrics.getDepression(data.forms?.PHQ9, data.journals);
            break;
        case Metrics.Anger:
            result = Metrics.getAnger(data.records);
            break;
        default:
            result = 0;
    }

    return result;
};

const convertValue = (v: number) => v == null ? null : clamp01(v) * 100;

export function getResilienceFromItems(data: MetricsSourceData, metrics?: Array<Metrics>): Resilience {
    const result: Resilience = {};

    metrics.forEach(metric => {
        result[metric] = getMeter(metric, data);
    });

    if (result.Depression) {
        return result;
    }

    if (!data.records || !data.records.length) {
        return null;
    }

    return result;
}

export function getResilienceMeters(data: MetricsSourceData, metrics: Metrics[], startTime: number, endTime: number): ResilienceMeterItem[] {
    const { current, previous } = getSplittedData(data, startTime, endTime);

    // Current mental data
    const currentResilience = getResilienceFromItems(current, metrics);
    const previousResilience = getResilienceFromItems(previous, metrics);

    if (currentResilience) {
        return metrics.map(metric => ({
            type: metric,
            value: convertValue(currentResilience[metric]),
            shift: compareResilience(currentResilience, previousResilience, metric),
        }));
    }

    return metrics.map(getEmptyMetricValue);
}
