import { computed, observable } from 'mobx';
import { ClientModel } from 'app/controllers/ClientModel';
import { ClientIntakeFormIded, CoachClientActions, AssessmentType, IntakeForms, ClientAssessments } from 'common/models';
import { formatDate, formatToDateTime, weekDays } from 'common/utils/dateHelpers';
import { Unsubscriber } from 'common/utils/unsubscriber';
import AppController from 'app/controllers';
import { PushToast } from 'app/viewModels/ToasterViewModel';
import logger from 'common/logger';

export class IntakeFormCard {
    loading: boolean;

    constructor(
        protected readonly entry: ClientIntakeFormIded,
        private readonly _clientGetter: () => ClientModel,
    ) {}

    private get intakeForm() { return IntakeForms[this.entry.formType]; }

    protected get client() { return this._clientGetter(); }

    get type() { return this.entry.formType; }

    get fullType() { return AssessmentType.getFullString[this.type]; }

    get clientName() { return this.client.card.firstName && this.client.card.lastName ? `${this.client.card.firstName} ${this.client.card.lastName}` : null; }

    @computed
    get date() { return formatDate(this.entry.date); }

    @computed
    get dateTime() { return formatToDateTime(this.entry.date); }

    get timestamp() { return this.entry.date; }

    get id() { return this.entry.id; }

    get recommendation() {
        return this.intakeForm?.scoreToRecommendation(this.score);
    }

    get score() { return this.intakeForm?.calculateScores(this.entry.answers); }

    get answersBlock() { return this.intakeForm?.answersBlock(this.entry.answers); }
}

export class AssessmentItem {
    @observable
    private _loading: boolean = false;

    @observable
    private _formType: AssessmentType;

    @observable
    private _clientId: string;

    private readonly _disposer: Unsubscriber = new Unsubscriber();

    get forms() { return this.model.assessments.forms; }

    get type() { return this._formType; }

    @computed
    get list(): ReadonlyArray<IntakeFormCard> {
        const forms = (this._formType && this.forms[this._formType]?.entries) || [];
        const list = forms
            .map(e => new IntakeFormCard(e, () => this.model));

        return list;
    }

    @computed
    get lastItem(): { id: string, title: string, date: string, type: AssessmentType } {
        const first = this.model.assessments?.forms[this._formType]?.entries[0];

        if (first === undefined) {
            return null;
        }

        const item = new IntakeFormCard(first, () => this.model);

        return {
            id: item.id,
            title: item.recommendation.title,
            date: `${weekDays[new Date(item.timestamp).getDay()]}, ${item.date}`,
            type: this._formType,
        };
    }

    @computed
    private get model() { return AppController.Instance.User.clients.getModel(this._clientId); }

    @computed
    get nextAssessment() {
        if (this.lastSent > this.lastPush) {
            return false;
        }
        return IntakeForms[this._formType].RecurrencyTimeMs !== Number.POSITIVE_INFINITY;
    }

    get date (): string {
        if (!this.isFormActive) {
            return null;
        }

        const reccurencyMs = IntakeForms[this._formType].RecurrencyTimeMs;
        const isRecurrency = reccurencyMs !== Number.POSITIVE_INFINITY;

        if (this.lastSent > this.lastPush) {
            return formatDate(this.lastSent);
        } else if (this.lastPush >= this.lastSent && isRecurrency) {
            return formatDate(this.lastPush + reccurencyMs);
        }

        return null;
    }

    get loading() { return this._loading; }

    get clientName() { return this.model.card.firstName && this.model.card.lastName ? `${this.model.card.firstName} ${this.model.card.lastName}` : null; }

    get clientId() {
        return this._clientId;
    }

    get fullType() { return  AssessmentType.getFullString[this._formType]; }

    setFormType = (clientId: string, type: AssessmentType) => {
        if (this._clientId === clientId && this._formType === type) {
            return;
        }

        this._clientId = clientId;
        this._formType = type;
    }

    get isFormActive() {
        return ClientAssessments.getIsActivated(this.model.account?.assessments, this._formType);
    }

    get lastPush() {
        return ClientAssessments.getDateProperty(this.model.account?.assessments, this._formType, 'lastPush');
    }

    get lastSent() {
        return ClientAssessments.getDateProperty(this.model.account?.assessments, this._formType, 'lastSent');
    }

    validateStatus() {
        if (this.isFormActive) {
            PushToast({ text: `${this._formType} is already activated` });
            return true;
        }

        // return error if status invalid
        return false;
    }

    activate = async (force = false) => {
        this._loading = true;

        try {
            if (force || !this.validateStatus()) {
                const resp = await AppController.Instance.User.clients.action(
                    this.model.card.id,
                    CoachClientActions.EditAssessments,
                    { type: this._formType, active: true });

                PushToast({ text: `${this.fullType} has been activated` });

                return !!resp?.status;
            }

            return false;
        } catch (e) {
            logger.warn(e);
            PushToast({ text: e.message });

            return false;
        } finally {
            this._loading = false;
        }
    }

    deactivate = async () => {
        this._loading = true;

        try {
            const resp = await AppController.Instance.User.clients.action(
                this.model.card.id,
                CoachClientActions.EditAssessments,
                { type: this._formType, active: false });

            PushToast({ text: `${this.fullType} has been deactivated` });

            return !!resp?.status;
        } catch (e) {
            logger.warn(e);
            PushToast({ text: e.message });

            return false;
        } finally {
            this._loading = false;
        }
    }

    dispose() {
        this._disposer.dispose();
    }
}
