import { computed, observable } from 'mobx';
import Firebase from 'common/services/firebase';
import { Clients as ClientsFunctions } from 'common/abstractions/functions';
import {
    ClientIntakeForm,
    AssessmentType,
    ClientAssessments,
    ClientAccountIded,
    ClientIntakeFormIded,
} from 'common/models';
import { TimeObservable } from 'common/utils/timeObservable';
import { AssessmentsController as AssessmentsResponsesController } from 'common/controllers/AssessmentsController';
import { IDisposable } from 'common/utils/unsubscriber';

export interface IAssessmentsController {
    readonly nextFormTypeAvailable: AssessmentType | false;
    readonly responses?: AssessmentsResponsesController;

    addResponse(entry: ClientIntakeForm): Promise<ClientIntakeFormIded>;
    isActive(type: AssessmentType): boolean;
}

const FetchResponses = false;

export class AssessmentsController implements IAssessmentsController, IDisposable {
    @observable.ref
    private _assessments: ClientAssessments;

    private _clientCardId: string;

    private _now = new TimeObservable(1000 * 30); // will refresh each 30 secs

    private readonly _responses = FetchResponses ? new AssessmentsResponsesController() : null;

    @computed
    public get nextFormTypeAvailable() {
        if (!this._assessments) {
            return null;
        }

        const nextActive = AssessmentType.EnabledTypes.value
            .find((value: AssessmentType) => this.isActive(value));
        return nextActive;
    }

    public get responses() { return this._responses; }

    // constructor() {
    //     reaction(() => this.nextFormTypeAvailable, formType => logger.log('AssessmentsController ==========================> ', formType));
    // }

    public isActive(type: AssessmentType): boolean {
        return ClientAssessments.getIsCooledDown(this._assessments, type, this._now.nowMs);
    }

    initialize(account: ClientAccountIded, clientUid: string) {
        this._clientCardId = account.id;
        this._assessments = account?.assessments;

        this._responses?.setAccount(clientUid, account.id, account.coachId);
    }

    async addResponse(entry: ClientIntakeForm): Promise<ClientIntakeFormIded> {
        if (!process.appFeatures.ASSESSMENTS_ENABLED) {
            throw new Error('IntakeForms feature is disabled');
        }

        try {
            const result = await Firebase.Instance.getFunction(ClientsFunctions.AddIntakeFormResponse)
                .execute({ entry, accountId: this._clientCardId });

            if (result.account.assessments) {
                this._assessments = result.account.assessments;
            }

            return result.entry;
        } catch (e) {
            if (e.code === 'failed-precondition') {
                this._assessments[entry.formType] = { active: false };
            }

            return null;
        }
    }

    dispose() {
        this._now.dispose();
        this._responses?.dispose();
    }
}
