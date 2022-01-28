
function getTime(d: Date | number): number {
    return d instanceof Date ? d.getTime() : d;
}

function getDate(d: Date | number): Date {
    return new Date(d);
}

export function getTimeSafe(d: Object | number, replaceWithDate = new Date()) {
    if (typeof d === 'number') {
        return d;
    }
    return replaceWithDate.getTime();
}

export function isNetworkDay(n: number) { return n >= 1 && n <= 5; }
export function isNetworkDate(d: Date) { return isNetworkDay(d.getUTCDay()); }

export function contains(start: Date | number, end: Date | number, target: Date | number) {
    const t = getTime(target);
    return getTime(start) <= t
        && t <= getTime(end);
}

export function countDays(start: Date, end: Date, condition: (d: Date) => boolean) {
    let count = 0;

    const current = new Date(start.getTime());
    do {
        if (!condition || condition(current)) {
            ++count;
        }

        current.setUTCDate(current.getUTCDate() + 1);
    } while (current.getTime() <= end.getTime());

    return count;
}

export type HourAndMinute = {
    hour: number,
    minute: number,
};

export type ConstantGranularity = 'second' | 'minute' | 'hour' | 'day' | 'week';
export type Granularity = ConstantGranularity | 'month' | 'year';

function granularityToMs(g: ConstantGranularity): number {
    switch (g) {
        case 'second': {
            return 1000;
        }
        case 'minute': {
            return 60 * granularityToMs('second');
        }
        case 'hour': {
            return 60 * granularityToMs('minute');
        }
        case 'day': {
            return 24 * granularityToMs('hour');
        }
        case 'week': {
            return 7 * granularityToMs('day');
        }
        default: {
            throw new Error('Unsupported granularity');
        }
    }
}

export function add(date: Date | number, amount: number, granularity: Granularity, local = false): Date {
    const res = getDate(date);
    switch (granularity) {
        case 'month': {
            if (local) {
                res.setMonth(res.getMonth() + amount);
            } else {
                res.setUTCMonth(res.getUTCMonth() + amount);
            }
            return res;
        }
        case 'year': {
            if (local) {
                res.setFullYear(res.getFullYear() + amount);
            } else {
                res.setUTCFullYear(res.getUTCFullYear() + amount);
            }
            return res;
        }
        default: {
            return new Date(res.getTime() + amount * granularityToMs(granularity));
        }
    }
}

export function equalDateByDay(left: Date, right: Date): boolean {
    return left.getDay() === right.getDay() && left.getMonth() === right.getMonth()
        && left.getFullYear() === right.getFullYear();
}

export function compare(d1: Date | number, d2: Date | number, g: Granularity, local?: boolean): number;
export function compare(d1: Date | number, d2: Date | number): number;

export function compare(d1: Date | number, d2: Date | number, g: Granularity = null, local = false) {
    const s1 = g ? startOf(d1, g, local) : d1;
    const s2 = g ? startOf(d2, g, local) : d2;
    return getTime(s1) - getTime(s2);
}

export function unix(d: Date | number) {
    return Math.floor(getTime(d) / 1000);
}

export function min(d1: Date, d2: Date): Date {
    const c = compare(d1, d2);
    return c < 0 ? d1 : d2;
}

export function max(d1: Date, d2: Date): Date {
    const c = compare(d1, d2);
    return c >= 0 ? d1 : d2;
}

export function clamp(d: Date, low: Date, high: Date) {
    const dt = d.getTime();
    const mint = low.getTime();
    const maxt = high.getTime();
    if (dt < mint) {
        return low;
    }
    if (dt > maxt) {
        return high;
    }
    return d;
}

export function startOf(d: Date | number, g: Granularity, local = false): Date {
    const ms = getTime(d);
    switch (g) {
        case 'week': {
            const startOfDay = startOf(d, 'day', local);
            if (local) {
                startOfDay.setDate(startOfDay.getDate() - startOfDay.getDay() + 1);
            } else {
                startOfDay.setUTCDate(startOfDay.getUTCDate() - startOfDay.getUTCDay() + 1);
            }
            return startOfDay;
        }
        case 'month': {
            const startOfDay = startOf(d, 'day', local);
            if (local) {
                startOfDay.setDate(1);
            } else {
                startOfDay.setUTCDate(1);
            }
            return startOfDay;
        }
        case 'year': {
            const startOfDay = startOf(d, 'day', local);
            if (local) {
                startOfDay.setMonth(0, 1);
            } else {
                startOfDay.setUTCMonth(0, 1);
            }
            return startOfDay;
        }
        case 'day': {
            const startOfHour = getDate(d);
            if (local) {
                startOfHour.setHours(0, 0, 0, 0);
            } else {
                startOfHour.setUTCHours(0, 0, 0, 0);
            }
            return startOfHour;
        }
        default: {
            const granMs = granularityToMs(g);
            const startMs = ms - ms % granMs;
            return new Date(startMs);
        }
    }
}

export function endOf(d: Date | number, g: Granularity, local = false): Date {
    const nextD = add(d, 1, g, local);
    const nextDStart = startOf(nextD, g, local);
    const nextDStartMs = nextDStart.getTime();
    return new Date(nextDStartMs - 1);
}

export function isSame(d1: Date | number, d2: Date | number, g: Granularity, local = false) {
    const s1 = startOf(d1, g, local);
    const s2 = startOf(d2, g, local);
    return s1.getTime() === s2.getTime();
}

export function decompose(date: number | Date, local: boolean, ...grans: Granularity[]): Partial<Record<Granularity, number>> {
    const res: Partial<Record<Granularity, number>> = {};

    const dd = getDate(date);
    const offset = local ? dd.getTimezoneOffset() * 60000 : 0;
    const ms = dd.getTime() + offset;

    return decomposeMs(ms, ...grans);
}

export function decomposeMs(ms: number, ...grans: Granularity[]): Partial<Record<Granularity, number>> {
    const res: Partial<Record<Granularity, number>> = {};

    // absolute vals
    let secs = Math.round(ms / 1000);
    let mins = Math.trunc(secs / 60);
    let hrs = Math.trunc(mins / 60);
    const days = Math.trunc(hrs / 24);

    // apply only selected granularities
    if (grans.includes('day')) {
        hrs = hrs % 24;
        res.day = days;
    }

    if (grans.includes('hour')) {
        mins = mins % 60;
        res.hour = hrs;
    }

    if (grans.includes('minute')) {
        secs = secs % 60;
        res.minute = mins;
    }

    if (grans.includes('second')) {
        res.second = secs;
    }

    return res;
}

export function formatTimespan(ms: Date | number, local = false): string {
    const decs = decompose(getTime(ms), local, 'second', 'minute', 'hour');

    const parts: string[] = [];

    if (decs.hour) {
        parts.push(`${decs.hour}h`);
    }

    if (decs.minute) {
        parts.push(`${decs.minute}m`);
    }

    parts.push(`${decs.second}s`);

    return parts.join(' ');
}

export function formatFullDate(date: Date | number, withYear: boolean = false): string {
    const d = getDate(date);
    const day = d.getDate();
    const month = monthsFull[d.getMonth()];
    const dayOfWeek = weekDaysFull[d.getDay()];
    if (withYear) {
        const year = d.getUTCFullYear();

        return `${month} ${day}, ${year}`;
    }

    return `${dayOfWeek}, ${day} ${month}`;
}

export function formatDateDayMonthYear(date: Date | number): string {
    const d = getDate(date);
    const day = d.getDate();
    const month = months[d.getMonth()];
    const dayOfWeek = weekDays[d.getDay()];
    const year = d.getUTCFullYear();

    return `${dayOfWeek}, ${month} ${day} ${year}`;
}

export function formatDate(date: Date | number): string {
    const d = getDate(date);
    const day = d.getDate();
    const month = months[d.getMonth()];

    return `${month} ${day}`;
}

export function formatDateMonthYear(date: Date | number): string {
    const d = getDate(date);
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  }

export function formatToDateTime(date: Date | number): string {
    const d = getDate(date);
    const day = d.getDate();
    const month = months[d.getMonth()];
    const strTime = timestampToTime(d.getTime());

    return `${month} ${day}, ${strTime}`;
}

export function formatToDatePicker(date: Date | number): string {
    if (!date) return null;

    const d = getDate(date);
    const day = d.getUTCDate();
    const month = d.getUTCMonth() + 1;
    const year = d.getUTCFullYear();

    return `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
}

export function formatToLocalDate(date: Date | number): string {
    if (!date) return null;

    const d = getDate(date);
    return d.toLocaleDateString();
}

export const weekDaysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const dayMS = 1000 * 60 * 60 * 24;

export function splitDatesByDay(dates: number[]): number[][] {
    if (!dates) {
        return [];
    }

    const res: number[][] = [];
    let currentDate: number;
    let tmpArr: number[];

    const datesCopy = [...dates];

    datesCopy
        .sort()
        .forEach(date => {
            if (!currentDate) {
                currentDate = new Date(date).getTime();
            }

            if (!tmpArr) {
                tmpArr = [];
                res.push(tmpArr);
            }

            if (isSame(date, currentDate, 'day', true)) {
                tmpArr.push(currentDate);
            } else {
                currentDate = new Date(date).getTime();
                tmpArr = [date];
                res.push(tmpArr);
            }
        });

    return res;
}

export function calculateAge(date: Date | number) {
    const d = getDate(date);
    const diff = Date.now() - d.getTime();
    const age = getDate(diff);

    return Math.abs(age.getUTCFullYear() - 1970);
}

const formatDigits = (n: number, digits = 2) => n.toString().padStart(digits, '0');

export function formatMS(ms: number): string {
    if (!ms && ms !== 0) {
        return '';
    }
    if (ms < 100) {
        return '00:00';
    }

    // if (ms < 1000) {
    //     return '00:01';
    // }

    const dec = decomposeMs(ms, 'second', 'minute', 'hour');
    return `${dec.hour ? (dec.hour.toString() + ':') : ''}${formatDigits(dec.minute || 0)}:${formatDigits(dec.second || 0)}`;
}

export function secToFormattedMin(totalSec: number): string {
    const sec = Math.round(totalSec) % 60;
    const minutes = Math.floor((totalSec + 1) / 60);
    let res = `${formatDigits(minutes)}`;

    if (sec) {
        res += ':';
        res += formatDigits(Math.floor(sec));
    }

    return res;
}

export function getDiscreteDiff(d1: number | Date, d2: number | Date, granularity: Granularity, local = false) {
    let v1: number, v2: number;

    switch (granularity) {
        case 'year': {
            const dd1 = getDate(d1);
            const dd2 = getDate(d2);
            v1 = local ? dd1.getFullYear() : dd1.getUTCFullYear();
            v2 = local ? dd2.getFullYear() : dd2.getUTCFullYear();
            break;
        }

        case 'month': {
            const dd1 = getDate(d1);
            const dd2 = getDate(d2);
            v1 = local ? dd1.getMonth() : dd1.getUTCMonth();
            v2 = local ? dd2.getMonth() : dd2.getUTCMonth();
            break;
        }

        default: {
            const s1 = startOf(d1, granularity, local).getTime();
            const s2 = startOf(d2, granularity, local).getTime();

            const diff = Math.abs(s1 - s2);
            const ms = granularityToMs(granularity);

            return Math.round(diff / ms);
        }
    }

    return Math.abs(v1 - v2);
}

export function timestampToTime(date: number): string {
    const d = new Date(date);
    const minutes = d.getMinutes();
    let hours = d.getHours();

    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    const strTime = hours + ':' + minutesStr + ' ' + ampm;

    return strTime;
}

export function getDaysStreak(dates: number[], descentOrder: boolean): number {
    let streak = 0;
    let d = dates;
    let dayToCompare = Date.now();

    if (descentOrder) {
        d = dates.slice().sort().reverse();
    }

    for (let i = 0; i < d.length; i++) {
        const diff = getDiscreteDiff(dayToCompare, d[i], 'day', true);

        if (diff >= 2) {
            break;
        }
        if (diff === 0 && streak === 0) {
            streak = 1;
        }

        streak += diff;

        if (diff > 0) {
            dayToCompare = d[i];
        }
    }

    return streak > 1 ? streak : 0;
}
