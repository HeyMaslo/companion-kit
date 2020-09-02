import { computed, observable, reaction } from 'mobx';
import * as ViewModels from 'common/viewModels';
import AppController from 'app/controllers';

import { Periods } from 'common/models/Periods';
import * as ChartsData from 'common/viewModels/charts';
import TabsViewModel from 'app/viewModels/components/TabsViewModel';
import JournalListViewModel from 'app/viewModels/JournalPage';
import SessionsPagePageViewModel from 'app/viewModels/SessionsPage';
import DocsPageViewModel from 'app/viewModels/DocsPage';
import { AssessmentsViewModel } from 'app/viewModels/Assessments';
import { AssessmentItem } from 'app/viewModels/AssessmentItemPage';
import { OverviewViewModel } from './OverviewViewModel';
import { KeyStorageConverted } from 'app/services/Storage';
import { Unsubscriber } from 'common/utils/unsubscriber';
import { AssessmentType, IntakeForms, ClientAssessments } from 'common/models';
import { calculateAge, weekDays } from 'common/utils/dateHelpers';
import { clamp } from 'common/utils/mathx';
import TimeTrackingViewModel from 'app/viewModels/TimeTracking/TimeTrackingViewModel';
import { ReportViewModel } from 'app/viewModels/ReportViewModel';
import GoalsViewModel from './GoalsViewModel';

const SelectedDateRangeStorage = new KeyStorageConverted<number>(
    'clientdetails:selecteddaterangeindex',
    i => i.toString(),
    v => +v,
);

const SelectedChartTypeStorage = new KeyStorageConverted<number>(
    'clientdetails:selectedcharttypeindex',
    i => i.toString(),
    v => +v,
);

const EmptyArray: any[] = [];

export class ClientDetailsViewModel {
    @observable
    private _clientId: string;

    @observable
    private _dateRangeSelect = new ViewModels.Select<Periods>(Periods.Helper.Values, p => Periods.Strings[p], SelectedDateRangeStorage.value);

    private readonly _tabs = new TabsViewModel();

    private readonly _overview = new OverviewViewModel(() => this.currentModel);
    private readonly _journal = new JournalListViewModel(() => this.currentModel);
    private readonly _sessions = new SessionsPagePageViewModel(() => this.currentModel);
    private readonly _docs = new DocsPageViewModel(() => this.currentModel);
    private readonly _intakeForms = new AssessmentItem();
    private readonly _assessment = new AssessmentsViewModel(() => this.currentModel);
    private readonly _timeTracking = new TimeTrackingViewModel(() => this.currentModel);
    private readonly _goals = process.appFeatures.GOALS_ENABLED && new GoalsViewModel(() => this.currentModel);

    private _report = process.appFeatures.NOTES_ON_INDIVIDUALS === true
        ? new ReportViewModel(() => this.currentModel)
        : null;

    private readonly _disposer: Unsubscriber = new Unsubscriber();

    constructor() {
        this._disposer.add(reaction(() => this._dateRangeSelect.selectedItem, v => SelectedDateRangeStorage.value = Periods.Helper.Values.indexOf(v)));
        this._disposer.add(reaction(() => this.chartTypeSelect.selectedItem, v => SelectedChartTypeStorage.value = this.chartTypeList.indexOf(v)));
    }

    setClientId = (id: string) => {
        if (this._clientId === id) {
            return;
        }

        this._clientId = id;
        this._intakeForms.setFormType(id, AssessmentType.phq9);
    }

    get inProgress() { return this._overview.inProgress; }

    get currentModel() { return AppController.Instance.User.clients.getModel(this._clientId); }
    // get selectedPeriod() { return this.selectedChartType !== Charts.phq9 ?  this._dateRangeSelect.selectedItem : Periods.Months6; }
    get selectedPeriod() { return this._dateRangeSelect.selectedItem; }
    get selectedChartType() { return this.chartTypeSelect.selectedItem; }

    get tabs() { return this._tabs; }

    get client() { return this.currentModel.card; }
    get clientAge() {
        const birthday = this.client.birthday;

        return birthday ? calculateAge(birthday) : null;
    }
    get dateSelect() { return this._dateRangeSelect; }

    get assessment() { return this._assessment; }
    get timeTracking() { return this._timeTracking; }
    get journal() { return this._journal; }
    get overview() { return this._overview; }
    get sessions() { return this._sessions; }
    get docs() { return this._docs; }
    get report() { return this._report; }
    get goals() { return this._goals; }

    get lastAssessmetCard () {
        let lastCard = null;

            if (this.selectedChartType === 'Self reported mood') {
                lastCard =  this.assessment.lastAssessmentCard;
            } else {
                const assessment = this.assessment.list.find(item => AssessmentType.getFullString[item.type] === this.selectedChartType);
                if (assessment && assessment.lastItem) {
                    lastCard = {
                        id: assessment.lastItem.id,
                        title: assessment.lastItem.recommendation.title,
                        date: `${weekDays[new Date(assessment.lastItem.timestamp).getDay()]}, ${assessment.lastItem.date}`,
                        type: assessment.lastItem.type,
                    };
                }
            }
            return lastCard;

    }

    @computed
    get chart(): ChartsData.ChartDataReadonly {
        if (!this.selectedChartType) return [];

        if (this.selectedChartType === 'Self reported mood') {
            return ChartsData.createFromMoods(
                this.currentModel.journal.entries
                    .filter(i => this.isInRange(i.date))
                    .map(i => ({ mood: i.mood, date: i.date })),
                this.mergePeriod,
                this.sentimentDateFormater,
            );
        } else {
            const type = AssessmentType.getValueFromString[this.selectedChartType];
            const list = (this.currentModel.assessments.forms[type]?.entries || []);

            return ChartsData.createFromAssessment(
                type,
                list
                    .filter(i => this.isInRange(i.date))
                    .map(i => ({ scores: IntakeForms[type].calculateScores(i.answers), date: i.date })),
                // this.mergePeriod,
                0,
                ChartsData.DateFormats.DayOfMonth,
            );
        }
    }

    isInRange = (dateMS: number) => {
        const diffMS = new Date().getTime() - dateMS;
        return diffMS < this.selectedPeriod * 1000;
    }

    dispose() {
        this._overview.dispose();
        this._disposer.dispose();
    }

    @computed
    private get chartTypeList() {
        const charts = (this.currentModel.account?.assessments && AssessmentType.EnabledTypes.value
            .filter(t => ClientAssessments.getIsActivated(this.currentModel.account?.assessments, t))) || EmptyArray;
        return ['Self reported mood'].concat(charts.map((c: AssessmentType) => AssessmentType.getFullString[c]));
    }

    @computed
    public get chartTypeSelect() {
        const selectedIndex = clamp(SelectedChartTypeStorage.value, 0, this.chartTypeList.length - 1, true);
        return new ViewModels.Select(this.chartTypeList, p => p, selectedIndex);
    }

    private get mergePeriod(): number {
        const day = 1000 * 3600 * 24;

        switch (this.selectedPeriod) {
            case Periods.ThisWeek: {
                return day;
            }

            case Periods.Month:
            case Periods.Months3:
            case Periods.Months6: {
                return day * 7;
            }

            default: {
                return day;
            }
        }
    }

    private get sentimentDateFormater() {
        switch (this.selectedPeriod) {
            case Periods.ThisWeek: {
                return ChartsData.DateFormats.DayOfWeek;
            }

            case Periods.Month:
            case Periods.Months3:
            case Periods.Months6: {
                return ChartsData.DateFormats.Week;
            }

            default: {
                return ChartsData.DateFormats.DayOfMonth;
            }
        }
    }
}
