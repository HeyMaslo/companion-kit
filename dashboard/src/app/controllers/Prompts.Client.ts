import { observable, transaction } from 'mobx';
import { ClientLibraryStateIded, PromptsLibraryIded, ClientPromptState, ClientLibraryState } from 'common/models/prompts';
import { IDisposable, Unsubscriber } from 'common/utils/unsubscriber';
import RepoFactory from 'common/controllers/RepoFactory';
import Firebase from 'common/services/firebase';
import { Coaches as CoachesFunctions } from 'common/abstractions/functions';
import { IAsyncController } from 'common/abstractions/controlllers/IAsyncController';
import { PromiseWrapper } from 'common/utils/promiseWrapper';
import { IActivityController, ActivityController } from 'common/controllers/ActivityController';
import { GoalStatusController, IGoalsController } from 'common/controllers/GoalStatusController';

export interface IClientPromptsController extends IAsyncController {
    readonly loading: boolean;

    readonly state: Readonly<ClientLibraryStateIded>;

    readonly prompts: IActivityController;
    readonly goals: IGoalsController;
}

export interface IParentPromptsController {
    readonly loading: boolean;
    readonly coachId: string;
}

export class ClientPromptsController implements IClientPromptsController, IDisposable {
    @observable
    private _loading = false;

    @observable
    private _state: ClientLibraryStateIded = null;

    private readonly _promptsActivity = process.appFeatures.EDITABLE_PROMPTS_ENABLED === true
        && new ActivityController<ClientPromptState, 'promptId'>(
            'promptId',
            diff => Firebase.Instance.getFunction(CoachesFunctions.UpdatePrompts)
                .execute({
                    client: {
                        clientId: this.clientUid,
                        states: diff,
                    },
                }),
        );

    private readonly _goals: GoalStatusController;

    private readonly _disposer = new Unsubscriber();
    private readonly _loadWrapper = new PromiseWrapper();

    constructor(readonly parent: IParentPromptsController, readonly clientUid: string, readonly library: Readonly<PromptsLibraryIded>) {
        if (!this.parent.coachId || !this.clientUid) {
            // keep it empty and silent... forever
            // TODO log it if needed
            // this._promptsActivity = null;
            throw new Error('ClientPromptsController: No coach ID or client ID');
            return;
        }

        this._goals = process.appFeatures.GOALS_ENABLED && new GoalStatusController(
            () => this._state,
            clientUid,
        );

        this.loadClientState();
    }

    public get loading() { return this.parent.loading || this._loading; }
    public get state() { return this._state; }

    public get prompts() { return this._promptsActivity; }
    public get goals() { return this._goals; }

    public ensureData() {
        return this._loadWrapper.promise;
    }

    private async loadClientState() {
        this._loadWrapper.begin();
        this._loading = true;
        try {
            const unsub = await RepoFactory.Instance.coaches.getClientPrompts(this.parent.coachId, this.clientUid, this.processState);

            this._disposer.add(unsub);
            this._loadWrapper.resolve();
        } catch (err) {
            this._loadWrapper.error(err);
        } finally {
            this._loading = false;
        }
    }

    private processState = async (clientPrompts: ClientLibraryStateIded) => {
        if (clientPrompts == null) {
            clientPrompts = {
                id: this.clientUid,
            };
        }

        transaction(() => {
            ClientLibraryState.migrate(clientPrompts, true);

            this._state = clientPrompts;

            this._promptsActivity.setItems(this._state.prompts);
        });

        await this.setDefaultData(clientPrompts);
    }

    private async setDefaultData(state: ClientLibraryStateIded) {
        if (!state?.prompts) {
            const prompts = this.library.types
                .filter(prompt => prompt.default)
                .map(prompt => prompt.id);

            await this._promptsActivity.activate(prompts);
            return;
        }
    }

    public dispose() {
        this._disposer.dispose();
    }
}
