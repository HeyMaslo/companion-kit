import { transaction, computed } from 'mobx';
import { createLogger } from 'common/logger';
import { AssessmentType, IntakeForms } from 'common/models';
import { Unsubscriber, IDisposable } from 'common/utils/unsubscriber';
import { AssessmentItemController } from 'common/controllers/AssessmentItemController';
import { IAsyncController } from 'common/abstractions/controlllers/IAsyncController';

const logger = createLogger('[AssessmentsController]');

export class AssessmentsController implements IDisposable, IAsyncController {
    private _forms: Partial<Record<AssessmentType, AssessmentItemController>> = {};

    private _disposer = new Unsubscriber();

    protected _coachUid: string;
    protected _clientCardId: string;
    protected _clientUid: string;

    private _loadingPromise: Promise<any> = null;

    @computed
    get loading() { return AssessmentType.EnabledTypes.value.some(type => this._forms[type].loading); }

    get forms(): Readonly<Partial<Record<AssessmentType, AssessmentItemController>>> { return this._forms; }

    constructor() {
        const loads: Promise<void>[] = [];
        AssessmentType.EnabledTypes.value.forEach(value => {
            if (IntakeForms[value]) {
                const form = new AssessmentItemController(value);
                this._forms[value] = form;
                this._disposer.add(form);
                loads.push(form.ensureData());
            }
        });

        this._loadingPromise = Promise.all(loads);
    }

    ensureData() {
        return this._loadingPromise;
    }

    setAccount(clientUid: string, accountId: string, coachUid: string) {
        if (this._clientUid === clientUid && this._clientCardId === accountId) {
            return;
        }

        transaction(() => {
            this._clientUid = clientUid;
            this._clientCardId = accountId;
            this._coachUid = coachUid;

            if (this._clientUid && this._clientCardId) {
                AssessmentType.EnabledTypes.value.forEach(type => {
                    if (IntakeForms[type]) {
                        const form = this._forms[type];
                        form.setAccount(clientUid, accountId, coachUid);
                    }
                });
            }
        });
    }

    dispose() {
        this._disposer.dispose();
    }
}
