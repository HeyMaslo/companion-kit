import { logger } from 'common/controllers/AuthController';

export enum NotificationTime {
    Morning = 'morning',
    Midday = 'midday',
    Evening = 'evening',
    ExactTime = 'exact',
}

type GeneralNotificationTime =
    | NotificationTime.Morning
    | NotificationTime.Midday
    | NotificationTime.Evening;

export type Schedule = {
    [NotificationTime.Morning]: boolean;
    [NotificationTime.Midday]: boolean;
    [NotificationTime.Evening]: boolean;
    [NotificationTime.ExactTime]: {
        active: boolean;
        value: number;
    };
};

export function getDefaultSchedule(): Schedule {
    return {
        [NotificationTime.Morning]: null,
        [NotificationTime.Midday]: null,
        [NotificationTime.Evening]: true,
        [NotificationTime.ExactTime]: {
            active: false,
            value: null,
        },
    };
}

export function timeToString(time: NotificationTime): string {
    switch (time) {
        case NotificationTime.Morning:
            return 'Morning';

        case NotificationTime.Midday:
            return 'Midday';

        case NotificationTime.Evening:
            return 'Evening';

        case NotificationTime.ExactTime:
            return 'Exact Time';

        default:
            return '';
    }
}

export function isTimeActive(
    selectedTime: Schedule,
    time: NotificationTime,
): boolean {
    if (!selectedTime || !time) {
        return false;
    }

    if (time === NotificationTime.ExactTime) {
        return (
            !!selectedTime[NotificationTime.ExactTime] &&
            selectedTime[NotificationTime.ExactTime].active
        );
    }

    return selectedTime[time];
}

const timeRange = {
    [NotificationTime.Morning]: {
        from: 7,
        to: 10,
    },
    [NotificationTime.Midday]: {
        from: 12,
        to: 14,
    },
    [NotificationTime.Evening]: {
        from: 18,
        to: 22,
    },
};

export function getNotificationTimeMS(time: GeneralNotificationTime): number {
    const range = timeRange[time];

    if (!range) {
        return null;
    }

    const now: Date = new Date();
    const nowMS: number = now.getTime();
    const nowH: number = now.getHours();

    const from = range && range.from;
    const to = range && range.to;

    const isNowInRange = nowH >= from && nowH < to;

    const dateFrom = now.setHours(from, 0, 0, 0);
    const dateTo = now.setHours(to, 0, 0, 0);
    let random = Math.round(Math.random() * (dateTo - dateFrom) + dateFrom);

    if (random < nowMS || isNowInRange) {
        random = shiftDateToNextDay(nowMS, random);
    }

    return random;
}

export function addDaysToDate(dateMS: number, daysCount: number = 1): number {
    const date = new Date(dateMS);
    return date.setDate(date.getDate() + daysCount);
}

export function addSecToDate(dateMS: number, secCount: number = 1): number {
    const date = new Date(dateMS);
    return date.setSeconds(date.getSeconds() + secCount);
}

export function correctExactDate(dateMS: number): number {
    if (!dateMS) {
        logger.warn('Unable to correct date. Invalid date', dateMS);
        return;
    }

    const nowMS = Date.now();

    if (dateMS < nowMS) {
        return shiftDateToNextDay(nowMS, dateMS);
    }

    return dateMS;
}

function shiftDateToNextDay(now: number, value: number) {
    const dayMS = 1000 * 60 * 60 * 24;
    const diffTimeMS = Math.abs(now - value);
    const diffDays = Math.ceil(diffTimeMS / dayMS);
    return value + diffDays * dayMS;
}
