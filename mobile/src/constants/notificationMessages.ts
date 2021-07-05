import { NotificationTime } from 'src/helpers/notifications';
import logger from 'common/logger';
import { replace } from 'common/utils/stringFormatting';

const morning = [
    "I'd love to hear what's on your mind.",
    "[name], can you spare a minute to journal in Companion kit? I'm curious to know how are feeling.",
    'Good morning, [name]! Clear your mind for the day.',
    'Thanks for including me in your morning routine.',
    'Start your day with a clear mind. Journal a few thoughts now.',
    'Ready to journal? Tap to start.',
    'Early to rise, early to journal is the best way to start a day.',
    "Your first hour of the day builds positive momentum. Let's get going!",
];

const midday = [
    'Journaling is a great way to deal with thoughts that worry you.',
    'The more you journal the easier it is for me to help.',
    "How's your day going so far? I'd love to hear about it.",
    "I'd love to hear from you. Stop by and leave me a journal.",
    'Hi [name], any thoughts you want to record now?',
    'Hi [name], want to take a break and journal your day so far?',
    'The person who moves a mountain begins by carrying away small stones. - Confucius',
];

const evening = [
    'How was your day [name]? Add a quick entry and let me know.',
    "Don't forget to check in with Companion kit. It really helps!",
    'Ready for bed? Have a good night!',
    'Good night, [name].',
    'Wishing you a good and peaceful sleep.',
    'Any thoughts about your day tomorrow? Fill me in.',
    "I'd love to hear about your day. I'm a good listener.",
    'What things would you like to sleep on tonight? Leave a journal about them now.',
    'Time to dream. Sleep well, [name]',
    'Hi [name], how did your day go?',
];

const texts = {
    [NotificationTime.Morning]: morning,
    [NotificationTime.Midday]: midday,
    [NotificationTime.Evening]: evening,
};

function spliceRandomMessage(
    messages: string[],
    settings?: { [x: string]: string },
) {
    if (!messages) {
        logger.warn('[get notificatin message error: Invalid parameter time');
        return '';
    }

    const randomIndex = Math.round(Math.random() * (messages.length - 1));
    const splice = messages.splice(randomIndex, 1);
    let message = splice && splice[0];

    /*
     * find and replace all settings items
     * 'Hi [name], any thoughts you want to record now?', { name: 'Andrew' } => 'Hi Andrew, any thoughts you want to record now?'
     */
    if (settings) {
        const keys = Object.keys(settings);
        keys.forEach((key) => {
            const search = `[${key}]`;
            const replacement = settings[key];
            message = replace(message, search, replacement);
        });
    }

    return message;
}

const intervals = {
    morning: { from: 4, to: 12 },
    midday: { from: 12, to: 20 },
    evening: { from: 20, to: 4 },
};

export function getMessagesForExactTime(
    dateMS: number,
    count: number,
    settings?: { [x: string]: string },
) {
    const res: string[] = [];
    const hours = new Date(dateMS).getHours();
    let messagesCopy: string[];

    if (hours >= intervals.morning.from && hours < intervals.morning.to) {
        messagesCopy = [...morning];
    } else if (hours >= intervals.midday.from && hours < intervals.midday.to) {
        messagesCopy = [...midday];
    } else if (
        hours >= intervals.evening.from ||
        hours < intervals.morning.to
    ) {
        messagesCopy = [...evening];
    }

    for (let i = 0; i < count; i++) {
        const message = spliceRandomMessage(messagesCopy, settings);
        res.push(message);
    }

    return res;
}

export function getRandomUniqMessages(
    time: NotificationTime,
    count: number,
    settings?: { [x: string]: string },
) {
    const res: string[] = [];
    const messagesCopy =
        time === NotificationTime.ExactTime
            ? [...morning, ...midday, ...evening]
            : [...(texts[time] || [])];

    for (let i = 0; i < count; i++) {
        const message = spliceRandomMessage(messagesCopy, settings);
        res.push(message);
    }

    return res;
}
