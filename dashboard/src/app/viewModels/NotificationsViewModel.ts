import { observable, autorun } from 'mobx';
import logger, { LogLevels } from 'common/logger';

export interface INotification {
    readonly message: string;

    readonly level?: LogLevels;
}

export interface INotificationsService {
    readonly current: INotification;

    push(n: INotification): void;
    // call it from UI after timeout or by click
    hideCurrent(): void;
}

export class NotificationsViewModel implements INotificationsService {
    private readonly _queue: INotification[] = [];

    @observable
    private _current: INotification = null;

    get current() { return this._current; }

    push(n: INotification) {
        this._queue.push(n);
        this.tryShowNext();
    }

    hideCurrent() {
        this._current = null;
    }

    private tryShowNext() {
        if (this._current || this._queue.length === 0) {
            return;
        }

        this._current = this._queue.shift();
    }
}

const Instance: INotificationsService = new NotificationsViewModel();

export default Instance;

// SIMPLE OBSERVER – for TEST

autorun(() => {
    if (Instance.current) {
        const level = Instance.current.level || 'log';
        logger.print(level, '[Notification]', Instance.current.message);
    }
});
