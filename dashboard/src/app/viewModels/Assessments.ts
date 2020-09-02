import { computed, observable, reaction } from 'mobx';
import { ClientModel } from 'app/controllers/ClientModel';
import { AssessmentType, ClientAssessments, IntakeForms } from 'common/models';
import { IntakeFormCard, AssessmentItem } from 'app/viewModels/AssessmentItemPage';
import * as ViewModels from 'common/viewModels';
import { Unsubscriber } from 'common/utils/unsubscriber';
import { weekDays } from 'common/utils/dateHelpers';

export class AssessmentCard {
    constructor(
        public readonly type: AssessmentType,
        private readonly _clientGetter: () => ClientModel,
    ) {}

    protected get client() { return this._clientGetter(); }

    @computed
    get lastItem() {
        const form = this.client.assessments.forms[this.type];
        if (!form || !form.entries.length) {
            return null;
        }

        return new IntakeFormCard(form.entries[0], () => this.client);
    }

    @computed
    get name() { return AssessmentType.getFullString[this.type]; }
    get clientId() { return this.client.card.id; }

    get status() {
        switch (ClientAssessments.getIsActivated(this.client.account.assessments, this.type)) {
            case true:
                return 'Active';
            case false:
                return 'Archived';
            default:
                return 'Not active';
        }
    }
}

export class AssessmentsViewModel {
    @observable
    private _loading: boolean = false;

    private readonly _disposer: Unsubscriber = new Unsubscriber();

    private readonly _intakeForm: AssessmentItem = new AssessmentItem();

    constructor(
        private readonly _clientGetter: () => ClientModel,
    ) {
        this._disposer.add(reaction(() => this.model.card, () => {
            this._assessmentsSelect.reset();
            this.intakeForm.setFormType(this.model.card.id, this._assessmentsSelect.selectedItem);
        }));

        this._disposer.add(reaction(() => this._assessmentsSelect.selectedItem, () => {
            if (this._assessmentsSelect.selectedItem !== this.intakeForm.type) {
                this.intakeForm.setFormType(this.model.card.id, this._assessmentsSelect.selectedItem);
                this.intakeForm.validateStatus();
            }
        }));
    }

    private get enabledTypes() { return AssessmentType.EnabledTypes.value; }

    @observable
    private _assessmentsSelect = new ViewModels.Select<AssessmentType>(this.enabledTypes, v => AssessmentType.getFullString[v]);

    get assessmentSelect() { return this._assessmentsSelect; }

    get loading() { return this._loading || this._intakeForm.loading; }
    get intakeForm() { return this._intakeForm; }

    @computed
    get lastAssessmentCard() {
        if (!!this.list.length) {
            const forms = this.enabledTypes;
            const list = forms
                .map((type: AssessmentType) => {
                    const form = this.model.assessments?.forms[type];
                    if (!form.entries.length) {
                        return null;
                    }

                    return form.entries[0];
                })
                .sort((a, b) => {
                    const dateA = a ? a.date : 0;
                    const dateB = b ? b.date : 0;
                    return dateB - dateA;
                });

            if (!list[0]) {
                return null;
            }

            const item = new IntakeFormCard(list[0], () => this.model);

            return {
                id: item.id,
                title: item.recommendation.title,
                date: `${weekDays[new Date(item.timestamp).getDay()]}, ${item.date}`,
                type: item.type,
            };
        }

        return null;
    }

    @computed
    get list(): ReadonlyArray<AssessmentCard> {
        if (!!this.model.account?.assessments) {
            const forms = this.enabledTypes;
            const list = forms
                .filter((type: AssessmentType) => !!this.model.account?.assessments[type])
                .map((type: AssessmentType) => new AssessmentCard(type, () => this.model));

            return list;
        }

        return [];
    }

    private get model() { return this._clientGetter(); }

    dispose() {
        this._disposer.dispose();
    }
}
