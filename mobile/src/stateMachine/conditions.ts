import { Event, IEvent } from 'common/utils/event';
import { Unsubscriber } from 'common/utils/unsubscriber';
import { TransitionObserver } from 'common/utils/transitionObserver';
import { ILogger, createLogger } from 'common/logger';

export namespace Conditions {
    export type ObservableBoolean = {
        condition: () => boolean,
    };
    export namespace ObservableBoolean {
        export function guard(c: General): c is ObservableBoolean {
            return (c as ObservableBoolean).condition != null;
        }
    }

    export type Trigger<T extends number = number> = {
        trigger: number | number[],
    };
    export namespace Trigger {
        export function guard(c: General): c is Trigger {
            return (c as Trigger).trigger != null;
        }

        export function matches<T extends number>(condition: Trigger<T>, trigger: T) {
            return Array.isArray(condition.trigger)
                ? condition.trigger.includes(trigger)
                : (condition.trigger === trigger);
        }
    }

    export type Simple = ObservableBoolean | Trigger;
    export namespace Simple {
        export function guard(c: General): c is Simple {
            return ObservableBoolean.guard(c) || Trigger.guard(c);
        }
    }

    export type Compositional = ObservableBoolean & Trigger & {
        compose: 'and' | 'or',
    };
    export namespace Compositional {
        export function guard(c: General): c is Compositional {
            return ObservableBoolean.guard(c) && Trigger.guard(c) && (c as Compositional).compose != null;
        }
    }

    export type General = Simple | Compositional;
}

export class ConditionObserver {
    private readonly _unsubscriber = new Unsubscriber();
    private readonly logger: ILogger;

    private readonly _satisfied = new Event();

    private _boolObserver: TransitionObserver<boolean> = null;
    private _lastTriggerResult = null;

    public get satisfied(): IEvent { return this._satisfied; }

    constructor(private readonly condition: Readonly<Conditions.General>, name?: string) {
        this.logger = createLogger(name, !name);

        if (Conditions.ObservableBoolean.guard(condition)) {
            this._boolObserver = new TransitionObserver(condition.condition)
                .cb(this._compute);
            this._unsubscriber.add(this._boolObserver.dispose);
        }
    }

    forceCheck() {
        return this._boolObserver?.forceCheck();
    }

    trigger(trigger: number) {
        if (Conditions.Trigger.guard(this.condition)) {
            this._lastTriggerResult = Conditions.Trigger.matches(this.condition, trigger);
            return this._compute();
        }
        return false;
    }

    private _compute = () => {
        this.logger.log('====> COMPUTE', this._boolObserver?.currentValue, this.condition.compose || '', this._lastTriggerResult || '<none>');

        let final: boolean;
        if (Conditions.Compositional.guard(this.condition)) {
            if (this.condition.compose === 'and') {
                final = this._boolObserver?.currentValue && this._lastTriggerResult;
            } else if (this.condition.compose === 'or') {
                final = this._boolObserver?.currentValue || this._lastTriggerResult;
            }
        } else {
            final = this._boolObserver?.currentValue || this._lastTriggerResult;
        }

        if (final) {
            this.logger.log('====== TRIGGERING, listeners =', this._satisfied.subscribersCount);
            this._satisfied.trigger();
            return true;
        }
    }

    dispose() {
        this._satisfied.reset();
        this._unsubscriber.dispose();
    }
}
