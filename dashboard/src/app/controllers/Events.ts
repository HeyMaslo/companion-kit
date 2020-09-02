import { observable, transaction } from 'mobx';
import { createLogger } from 'common/logger';
import { getTimeSafe } from 'common/utils/dateHelpers';
import RepoFactory from 'common/controllers/RepoFactory';
import { Unsubscriber, IDisposable } from 'common/utils/unsubscriber';
import { Clients as ClientsFunctions } from 'common/abstractions/functions';
import { AnyEvent, EventIded, PromptEvent, AssessmentEvent } from 'common/models/Events';
import Firebase from 'common/services/firebase';
import { transferFields } from 'common/utils/fields';

import { IItemsCRUDController, ItemsCRUDController } from 'common/controllers/ItemsCRUDController';

const logger = createLogger('[EventsController]');

const defaultEntryDate = new Date(0);

export interface IEventsController {
    readonly loading: boolean;
    readonly entries: ReadonlyArray<EventIded>;

    readonly edit: IItemsCRUDController<AnyEvent>;
}

export class EventsController implements IEventsController, IDisposable {
    @observable
    protected _entries: EventIded[] = [];

    @observable
    private _loading: boolean = null;

    protected _coachUid: string;
    protected _clientCardId: string;
    protected _clientUid: string;

    private _disposer = new Unsubscriber();

    private _crud = new ItemsCRUDController<EventIded>(
        () => this._entries,
        dto => Firebase.Instance.getFunction(ClientsFunctions.EventsEndpoint)
            .execute({
                clientId: this._clientUid,
                accountId: this._clientCardId,
                ...dto,
            }),
        (from, to) => transaction(() => {
            if (AnyEvent.isPrompt(from)) {
                transferFields(from, null, to as PromptEvent, 'text', 'type', 'timestamp', 'frequency', 'promptId');
            } else if (AnyEvent.isAssessment(from)) {
                transferFields(from, null, to as AssessmentEvent, 'text', 'type', 'timestamp', 'frequency', 'assessmentType');
            }
        }),
    );

    static sortEntries(clients: EventIded[]) {
        clients.sort((c1, c2) => getTimeSafe(c2.timestamp, defaultEntryDate) - getTimeSafe(c1.timestamp, defaultEntryDate));
    }

    get edit() { return this._crud; }

    get entries(): ReadonlyArray<EventIded> { return this._entries; }
    get loading() { return this._loading; }

    setAccount(coachUid: string, accountId: string, clientUid: string) {
        if (this._clientUid === clientUid && this._clientCardId === accountId) {
            return;
        }

        transaction(() => {
            this._loading = null;
            this._clientUid = clientUid;
            this._clientCardId = accountId;
            this._coachUid = coachUid;
        });

        if (this._clientUid && this._clientCardId) {
            this.fetchSchedule();
        }
    }

    private async fetchSchedule() {
        this._disposer.dispose();

        this._loading = true;

        logger.log('Fetching events...');
        try {
            const unsub = await RepoFactory.Instance.clients.getClientEvents(
                this._clientUid,
                this._clientCardId,
                this.processEvents,
            );

            this._disposer.add(unsub);
        } catch (err) {
            logger.error('Failed to fetch events. Error:', err);
            this._loading = false;
        }
    }

    private processEvents = (items: EventIded[]) => {
        logger.log('Events fetched count =', items.length);

        const observs = items.map(i => observable.object(i));

        EventsController.sortEntries(observs);

        transaction(() => {
            this._loading = false;
            this._entries.length = 0;
            this._entries.push(...observs);
        });
    }

    dispose() {
        this._disposer.dispose();
    }
}
