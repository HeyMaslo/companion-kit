import { autorun, computed, observable } from 'mobx';
import logger from 'common/logger';
import { ClientModel } from 'app/controllers/ClientModel';
import AppController from 'app/controllers';
import { WordReference, ClientJournalEntryIded } from 'common/models';
import JournalListViewModel from './JournalPage';
import Moods from 'common/models/Moods';
import * as ViewModels from 'common/viewModels';
import { Periods } from 'common/models/Periods';
import { Unsubscriber } from 'common/utils/unsubscriber';
import Categories, { CATEGORIES } from 'app/constants/categories';
import * as dateHelpers from 'common/utils/dateHelpers';

const EmptyArr: any[] = [];

export type PersonaMessage = {
    greeting: string,
    message: string,
};

export class OverviewViewModel {

    @observable
    private _inProgress = false;

    @observable
    private _wordsFilter = new ViewModels.SelectString(Categories.AllCategories, 0);

    @observable
    private _mentalsDateRange = new ViewModels.Select<Periods>(Periods.Helper.Values, p => Periods.Strings[p], 0);

    readonly Highlights: JournalListViewModel;

    private readonly _disposer: Unsubscriber = new Unsubscriber();

    constructor(private _clientGetter: () => ClientModel) {

        this._disposer.add(autorun(() => {
            this.model.period = this.selectedPeriod;
        }));

        this.Highlights = new JournalListViewModel(this._clientGetter, this.journalFilter);
    }

    get wordsFilter() { return this._wordsFilter; }

    private get model() { return this._clientGetter(); }

    get client() {
        const client = this.model;
        return client && client.card;
    }

    get empty() { return this.model.journal.entries.length === 0; }

    get inProgress() { return this._inProgress; }

    get coachName() { return AppController.Instance.User.firstName; }
    get clientName() { return this.client.firstName && this.client.lastName ? `${this.client.firstName} ${this.client.lastName}` : null; }

    get dateSelect() { return this._mentalsDateRange; }
    get selectedPeriod() { return this._mentalsDateRange.selectedItem; }

    @computed
    get infographics() { return this.model.resilienceMeters; }

    @computed
    get filteredWords() {
        const result: Array<WordReference> = [];

        if (!this._wordsFilter.selectedValue) {
            return [];
        }

        if (this._wordsFilter.selectedValue === Categories.ALL) {
            return this.words;
        }

        CATEGORIES[this._wordsFilter.selectedValue].forEach(cat => {
            const words = this.words.filter(word => word.categories.includes(cat));
            words.forEach(word => {
                result.push(word);
            });
        });

        return result;
    }

    @computed
    get words(): WordReference[] { return this.model.records.words || EmptyArr; }

    get insights() {
        return this.model.insights;
    }

    @computed
    get personaMessage(): PersonaMessage {
        return this.getNewRewardPersonaMessage() || {
            greeting: `Hey ${this.coachName}!`,
            message: 'All is going well. Hope you have a great day.',
        };
    }

    journalFilter = (arr: ClientJournalEntryIded[]) => {
        const mid = (Moods.Max + Moods.Min) / 2;
        const filtered = arr.filter(e => !e.private);

        // absolute diff from mid value
        const compare = (v: number) => Math.abs(v - mid);

        const sorted = filtered.sort((a, b) => compare(b.mood) - compare(a.mood));
        return sorted.slice(0, 4);
    }

    public onFeedBack = async (index: number, answer: boolean) => {
        logger.log(`Submitting a feedback: ${answer} for insight with index: ${index}`);

        try {
            await this.model.feedbackOnInsight(index, answer);
        } catch (err) {
            logger.error('Failed to post feedback, err:', err);
        }
    }

    dispose() {
        this._disposer.dispose();
    }

    private getNewRewardPersonaMessage(): PersonaMessage {
        const date = this.model.rewardInfo?.date;
        const daysDiff = date && dateHelpers.getDiscreteDiff(date, Date.now(), 'day', true);

        if (!date || daysDiff > 7) {
            return null;
        }

        const agoStr = dateHelpers.isSame(date, Date.now(), 'day')
            ? 'today'
            : (daysDiff < 2
                ? 'yesterday'
                : `${Math.round(daysDiff)} days ago`
            );

        const countStr = this.model.rewardInfo.checkInsCount > 1
            ? `${this.model.rewardInfo.checkInsCount} check-ins`
            : `their first check-in`;

        return {
            greeting: 'New Milestone',
            message: `${this.clientName} completed ${countStr} ${agoStr}, on ${dateHelpers.formatDate(date)}`,
        };
    }
}
