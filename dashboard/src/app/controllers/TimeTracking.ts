import { observable, transaction, toJS } from 'mobx';
import { createLogger } from 'common/logger';
import { getTimeSafe } from 'common/utils/dateHelpers';
import { TimeTrackingEntry, TimeTrackingEntryIded } from 'common/models/TimeTracking';
import RepoFactory from 'common/controllers/RepoFactory';
import Firebase from 'common/services/firebase';
import { Coaches as CoachesFunctions } from 'common/abstractions/functions';
import Identify from 'common/models/Identify';
import { Unsubscriber } from 'common/utils/unsubscriber';
import { IAsyncController } from 'common/abstractions/controlllers/IAsyncController';
import { PromiseWrapper } from 'common/utils/promiseWrapper';

export const logger = createLogger('[TimeTrackingController]');

export class TimeTrackingController implements IAsyncController {
    @observable
    private _loading: boolean = null;

    @observable
    protected _entries: TimeTrackingEntryIded[] = [];

    private _coachId: string;
    private _clientCardId: string;
    private _clientUid: string;

    private readonly _disposer = new Unsubscriber();
    private readonly _loadWrapper = new PromiseWrapper();

    static sortEntries(items: TimeTrackingEntryIded[]) {
        items.sort((s1, s2) => {
            const diff = getTimeSafe(s2.date) - getTimeSafe(s1.date);
            if (diff === 0) {
                return getTimeSafe(s2.timestamp) - getTimeSafe(s1.timestamp);
            }
            return diff;
        });
    }

    constructor() {
        this._loadWrapper.begin();
    }

    protected get coachId() { return this._coachId; }
    protected get clientCardId() { return this._clientCardId; }

    get entries(): ReadonlyArray<TimeTrackingEntryIded> { return this._entries; }
    get loading() { return this._loading; }

    setAccount(coachId: string, clientCardId: string, clientUid: string) {
        if (this._coachId === coachId && this._clientCardId === clientCardId) {
            return;
        }

        this._coachId = coachId;
        this._clientCardId = clientCardId;
        this._clientUid = clientUid;

        this.fetchTimeTracking();
    }

    async create(timeTracking: TimeTrackingEntryIded): Promise<TimeTrackingEntryIded> {
        if (!this.coachId || !this.clientCardId) {
            throw new Error('Not initialized');
        }

        try {
            timeTracking.id = null;

            const newTracking = await Firebase.Instance.getFunction(CoachesFunctions.TimeTrackingEndpoint)
                .execute({ timeTracking, clientCardId: this.clientCardId });

            return newTracking;
        } catch (err) {
            logger.warn('Error during time tracking create:');
            logger.error(err);
            return null;
        }
    }

    async duplicate(timeTrackingId: string): Promise<TimeTrackingEntryIded> {
        if (!this.coachId || !this.clientCardId) {
            throw new Error('Not initialized');
        }

        const timeTracking = this._entries.find(s => s.id === timeTrackingId);
        if (!timeTracking) {
            throw new Error('Time Tracking not found');
        }

        try {
            const data = toJS({...timeTracking, id: null});
            const newTracking = await Firebase.Instance.getFunction(CoachesFunctions.TimeTrackingEndpoint)
                .execute({ timeTracking: data, clientCardId: this.clientCardId });

            return newTracking;
        } catch (err) {
            logger.warn('Error during time tracking duplicate:');
            logger.error(err);
            return null;
        }
    }

    async update(timeTracking: Identify<Partial<TimeTrackingEntry>>): Promise<TimeTrackingEntryIded> {
        if (!this.coachId || !this.clientCardId) {
            throw new Error('Not initialized');
        }
        try {
            const res = await Firebase.Instance.getFunction(CoachesFunctions.TimeTrackingEndpoint)
                .execute({clientCardId: this.clientCardId, timeTracking });

            return res;
        } catch (err) {
            logger.warn('Error during time tracking edit:');
            logger.error(err);

            return null;
        }
    }

    async delete(timeTrackingId: string): Promise<TimeTrackingEntryIded> {
        const existingIndex = this._entries.findIndex(s => s.id === timeTrackingId);
        if (existingIndex < 0) {
            throw new Error('Time Tracking not found');
        }

        const existing = await Firebase.Instance.getFunction(CoachesFunctions.TimeTrackingEndpoint)
            .execute({clientCardId: this.clientCardId, timeTracking: {id: timeTrackingId}, remove: true });

        return existing;
    }

    public ensureData() {
        return this._loadWrapper.promise;
    }

    private async fetchTimeTracking() {
        if (!this._coachId || !this._clientCardId) {
            return;
        }

        this._loading = true;

        this._disposer.dispose();

        logger.log('Fetching items...');
        try {
            const fetchRes = await RepoFactory.Instance.clientCards.getTimeTrackings(this._coachId, this._clientCardId, this.processItems);

            this._disposer.add(fetchRes);
            logger.log('Subscribed to time tracking...');
        } catch (err) {
            logger.error('Failed to fetch entries. Error:', err);
            this._loading = false;
            this._loadWrapper.error(err);
        }
    }

    private processItems = (items: TimeTrackingEntryIded[]) => {
        logger.log('Entries fetched count =', items.length);

        const observs = items.map(i => observable.object(i));

        TimeTrackingController.sortEntries(observs);

        transaction(() => {
            this._loading = false;
            this._entries.length = 0;
            this._entries.push(...observs);
        });

        this._loadWrapper.resolve();
    }

    public dispose() {
        this._disposer.dispose();
    }
}
