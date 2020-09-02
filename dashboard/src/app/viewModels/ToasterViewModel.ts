import { Event } from 'common/utils/event';

export type ToastMessage = {
    text: string,
};

const Queue = [] as ToastMessage[];
const Enqueued = new Event();

export function PushToast(message: ToastMessage) {
    if (!message || Queue.find(qi => qi.text === message.text)) {
        return;
    }

    Queue.push(message);
    Enqueued.trigger();
}

export const Render = {
    get first() { return Queue[0]; },

    didRender() {
        Queue.shift();
    },

    get Enqueued() { return Enqueued; },
};
