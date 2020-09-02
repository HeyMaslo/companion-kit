import { observable, transaction, computed } from 'mobx';
import AppController from 'app/controllers';
import { IntakeFormCard } from 'app/viewModels/AssessmentItemPage';
import { AssessmentType } from 'common/models';

export class IntakeFormViewModel {
    @observable
    private _questionnaireId: string;

    @observable
    private _formType: AssessmentType;

    @observable
    private _clientId: string;

    @observable
    private _inProgress = false;

    setFormEntry = (clientId: string, type: AssessmentType, questionnaireId: string) => {
        transaction(() => {
            this._formType = type;
            this._clientId = clientId;
            this._questionnaireId = questionnaireId;
        });
    }

    get inProgress() { return this._inProgress || this.client.loading || this.formItem?.loading; }

    @computed
    private get client() { return AppController.Instance.User.clients.getModel(this._clientId); }

    private get assessment() { return this.client?.assessments?.forms[this._formType]; }

    private get form() { return this.assessment?.entries.find(s => s.id === this._questionnaireId); }

    @computed
    get formItem() { return this.form && new IntakeFormCard(this.form, () => this.client); }

    get entryExists() { return this._questionnaireId ? this.assessment?.getIsEntryExists(this._questionnaireId) : null; }
}
