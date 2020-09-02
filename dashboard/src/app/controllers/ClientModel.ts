import {
    ClientCardIded,
    IntelligentInsightFeedbackIded,
    IntelligentInsightFeedback,
    IntelligentInsight,
    AssessmentType, ClientAccountIded, ClientRewardInfo,
} from 'common/models';
import { observable, computed } from 'mobx';
import { Periods } from 'common/models/Periods';
import { AssessmentsController } from 'common/controllers/AssessmentsController';
import { JournalController } from 'common/controllers/JournalController';
import { RecordsController } from 'common/controllers/RecordsController';
import * as IntelligentInsights from 'common/controllers/IntelligentInsights';
import { SessionsController, ISessionsController } from './Sessions';
import { DocumentsController, IDocumentController } from './Documents';
import { Unsubscriber } from 'common/utils/unsubscriber';
import RepoFactory from 'common/controllers/RepoFactory';
import { getResilienceMeters, MetricsSourceData } from 'common/helpers/metrics';
import { Metrics } from 'common/models/Metrics';
import { EventsController, IEventsController } from 'app/controllers/Events';
import { TimeTrackingController } from 'app/controllers/TimeTracking';
import { TimeObservable } from 'common/utils/timeObservable';
import { IAsyncController } from 'common/abstractions/controlllers/IAsyncController';
import { PromiseWrapper } from 'common/utils/promiseWrapper';

export const ResilienceMetrics: Metrics[] = [
    Metrics.Anxiety,
    Metrics.Depression,
    Metrics.Anger,
];

export class ClientModel implements IAsyncController {

    @observable
    private _period: Periods = null;

    @observable.ref
    private _card: ClientCardIded;

    @observable.ref
    private _account: ClientAccountIded;

    private _assessments: AssessmentsController;
    private _timeTracking: TimeTrackingController; // = process.appFeatures.COACH_TIME_TRACKING_ENABLED === true ? new TimeTrackingController() : null;
    private _journal: JournalController; // = new JournalController();
    private _records: RecordsController; // = new RecordsController();
    private _sessions: SessionsController; // = process.appFeatures.SESSIONS_DISABLED === true ? null : new SessionsController();
    private _documents: DocumentsController; // = new DocumentsController();
    private _events: EventsController; // = new EventsController();

    private readonly _disposer = new Unsubscriber();

    @observable
    private _insightsFeedbacks: IntelligentInsightFeedbackIded[];

    private _insightsFull: IntelligentInsight[] = [];

    private _today = new TimeObservable(3600 * 1000);

    private readonly _loadWrapper = new PromiseWrapper();

    constructor(
        private readonly _coachId: string,
        card: ClientCardIded,
    ) {
        this.setClient(card);
        if (!card.clientId) {
            this._loadWrapper.begin();
        }
    }

    @computed
    get loading() { return this._journal?.loading || this._records?.loading || this._assessments?.loading; }

    get assessments() {
        if (process.appFeatures.ASSESSMENTS_ENABLED === true && !this._assessments) {
            this._assessments = new AssessmentsController();
            this._disposer.add(this._assessments);
            this._assessments?.setAccount(this._card.clientId, this._card.id, this._coachId);
        }

        return this._assessments;
    }
    get timeTracking() {
        if (process.appFeatures.COACH_TIME_TRACKING_ENABLED === true && !this._timeTracking) {
            this._timeTracking = new TimeTrackingController();
            this._disposer.add(this._timeTracking);
            this._timeTracking?.setAccount(this._coachId, this._card.id, this._card.clientId);
        }
        return this._timeTracking;
    }
    get journal() {
        if (!this._journal) {
            this._journal = new JournalController();
            this._disposer.add(this._journal);
            this._journal?.setAccount(this._card.clientId, this._card.id, this._coachId);
        }
        return this._journal;
    }
    get records() {
        if (!this._records) {
            this._records = new RecordsController();
            this._disposer.add(this._records);
            this._records?.setClient(this._coachId, this._card.clientId, this.displayName);
        }
        return this._records;
    }
    get sessions(): ISessionsController {
        if (process.appFeatures.SESSIONS_DISABLED !== true && !this._sessions) {
            this._sessions = new SessionsController();
            this._disposer.add(this._sessions);
            this._sessions?.setAccount(this._coachId, this._card.id, this._card.clientId);
        }
        return this._sessions;
    }
    get documents(): IDocumentController {
        if (!this._documents) {
            this._documents = new DocumentsController();
            this._disposer.add(this._documents);
            this._documents?.setAccount(this._coachId, this._card.id);
        }
        return this._documents;
    }
    get events(): IEventsController {
        if (!this._events) {
            this._events = new EventsController();
            this._disposer.add(this._events);
            this._events?.setAccount(this._coachId, this._card.id, this._card.clientId);
        }
        return this._events;
    }

    get card() { return this._card; }
    get account() { return this._account; }

    @computed
    get displayName() { return `${this._card.firstName || '?'} ${this._card.lastName || '?'}`; }

    @computed
    get resilienceMeters() {
        const data: MetricsSourceData = {
            journals: this.journal.entries,
            records: this.records.items,
            forms: {
                [AssessmentType.phq9]: this._assessments?.forms?.PHQ9?.entries,
            },
        };

        const to = this._today.nowMs;
        const from = to - this.period * 1000;

        return getResilienceMeters(data, ResilienceMetrics, from, to);
    }

    get period() { return this._period; }
    set period(p: Periods) {
        if (p === this._period) {
            return;
        }
        this._period = p;
    }

    get rewardInfo(): ClientRewardInfo { return this._account?.sharedReward; }

    ensureData() {
        return this._loadWrapper.promise;
    }

    public setClient(card: ClientCardIded) {
        if (!card) {
            throw new Error('[ClientModel] got null card');
        }

        this._card = card;

        if (this._card.id && this._card.clientId) {
            this.setClientAccount(this._card.clientId, this._card.id);
            this._assessments?.setAccount(this._card.clientId, this._card.id, this._coachId);
            this._journal?.setAccount(this._card.clientId, this._card.id, this._coachId);
            this._sessions?.setAccount(this._coachId, this._card.id, this._card.clientId);
            this._records?.setClient(this._coachId, this._card.clientId, this.displayName);
            this._documents?.setAccount(this._coachId, this._card.id);
            this._timeTracking?.setAccount(this._coachId, this._card.id, this._card.clientId);
            this._events?.setAccount(this._coachId, this._card.id, this._card.clientId);
        }

        if (this._card.clientId && this._loadWrapper.isRunning) {
            this._loadWrapper.resolve();
        }

        // this._fetchInsightsFeedback();
    }

    @computed
    private get insightsFull() {
        if (!this._insightsFull.length) {
            this._insightsFull = IntelligentInsights.generate(
                {
                    clientName: this.card?.firstName || 'client',
                    count: 4,
                    timePeriod: Periods.Strings[this.period],
                    journals: this.journal.entries,
                },
                this.records.items,
            );
        }

        return this._insightsFull;
    }

    @computed
    public get insights(): string[] {
        return this.insightsFull.map(i => i.result);
    }

    private async setClientAccount(clientUid: string, accountId: string): Promise<void> {
        this._disposer.execute('GETACC');

        const accountUnsubscribe = await RepoFactory.Instance.clients.getAccount(clientUid, accountId, c => { this._account = c; });
        this._disposer.add(accountUnsubscribe, 'GETACC');
    }

    private async _fetchInsightsFeedback() {
        const InsightsFeedbackDisposerId = 'insights';

        this._disposer.execute(InsightsFeedbackDisposerId);

        if (!this._card?.id || !this._card?.clientId || !this._coachId) {
            this._insightsFeedbacks = [];
            return;
        }

        this._disposer.add(await RepoFactory.Instance.coaches.getInsightsFeedback(this._coachId, this._card.id, (items: IntelligentInsightFeedbackIded[]) => {
            this._insightsFeedbacks = items;
        }), InsightsFeedbackDisposerId);
    }

    public async feedbackOnInsight(index: number, useful: boolean) {
        if (!this._coachId || !this._card?.clientId || !this._card?.id) {
            return;
        }

        const insight = this.insightsFull[index];
        if (!insight) {
            return;
        }

        const feedback: IntelligentInsightFeedback = {
            coachId: this._coachId,
            clientId: this._card.clientId,
            date: new Date().getTime(),
            result: insight.result,
            templateId: insight.templateId,
            useful: useful,
        };

        await RepoFactory.Instance.coaches.saveInsightFeedback(this._coachId, this._card.id, feedback);
    }

    dispose() {
        this._disposer.dispose();
    }
}
