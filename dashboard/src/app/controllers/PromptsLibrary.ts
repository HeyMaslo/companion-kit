import { observable } from 'mobx';
import { IDisposable, Unsubscriber } from 'common/utils/unsubscriber';
import RepoFactory from 'common/controllers/RepoFactory';
import {
    PromptsLibraryIded,
    PromptType,
    InterventionTip,
    TipsLabels,
    GoalType,
} from 'common/models/prompts';
import Firebase from 'common/services/firebase';
import { Coaches as CoachesFunctions } from 'common/abstractions/functions';
import { transferFields } from 'common/utils/fields';
import { IAsyncController } from 'common/abstractions/controlllers/IAsyncController';
import { PromiseWrapper } from 'common/utils/promiseWrapper';
import { IClientPromptsController, ClientPromptsController, IParentPromptsController } from './Prompts.Client';

import { IItemsCRUDController, ItemsCRUDController } from 'common/controllers/ItemsCRUDController';

export interface IPromptsController extends IAsyncController {
    readonly loading: boolean;
    readonly library: Readonly<PromptsLibraryIded>;

    readonly crud: IItemsCRUDController<PromptType>;
    readonly tips: IItemsCRUDController<InterventionTip>;

    getClientState(clientUid: string): IClientPromptsController;
    filterInterventions(feelings: TipsLabels[]): InterventionTip[];
}

export class PromptsController implements IPromptsController, IParentPromptsController, IDisposable {
    @observable
    private _loading = false;

    @observable
    private _library: PromptsLibraryIded;

    private readonly _clients: Record<string, ClientPromptsController> = {};

    private readonly _disposer = new Unsubscriber();
    private readonly _loadingWrap = new PromiseWrapper();

    private _libraryChecked = false;

    private readonly _promptsCrud = process.appFeatures.EDITABLE_PROMPTS_ENABLED && new ItemsCRUDController<PromptType>(
        () => this._library.types,
        dto => Firebase.Instance.getFunction(CoachesFunctions.UpdatePrompts)
            .execute(dto),
        (from, to) => transferFields(from, null, to, 'categoryId', 'text'),
    );

    private readonly _tipsCrud = process.appFeatures.INTERVENTIONS_ENABLED && new ItemsCRUDController<InterventionTip>(
        () => this._library.tips,
        dto => Firebase.Instance.getFunction(CoachesFunctions.UpdateInterventionTips)
            .execute(dto),
        (from, to) => transferFields(from, null, to, 'text', 'labels'),
    );

    // private readonly _goalsCrud = process.appFeatures.GOALS_ENABLED && new ItemsCRUDController<GoalType>(
    //     () => this._library.goals,
    //     dto => Firebase.Instance.getFunction(CoachesFunctions.UpdateGoals)
    //         .execute(dto),
    //     (from, to) => transferFields(from, null, to, 'text'),
    // );

    constructor(readonly coachId: string) {
        if (!this.coachId) {
            throw new Error('PromptsLibrary: no coach ID');
        }
        this.initialize();
    }

    public get loading() {
        return this._loading;
    }

    public get library(): Readonly<PromptsLibraryIded> {
        return this._library;
    }

    public get crud() { return this._promptsCrud; }
    public get tips() { return this._tipsCrud; }
    // public get goals() { return this._goalsCrud; }

    public ensureData() {
        return this._loadingWrap.promise;
    }

    private async initialize() {
        this._loadingWrap.begin();
        await this.syncLibrary();
        this._loadingWrap.resolve();
    }

    public getClientState(clientUid: string): IClientPromptsController {
        if (!clientUid) {
            throw new Error('PromptsController.getClientState: clientUid expected');
        }
        if (!this.library) {
            return null;
        }

        let existing = this._clients[clientUid];
        if (!existing) {
            existing = new ClientPromptsController(this, clientUid, this.library);
            this._disposer.add(existing);
            this._clients[clientUid] = existing;
        }
        return existing;
    }

    private async syncLibrary() {
        this._loading = true;

        const linUnsub = 'lib';
        this._disposer.execute(linUnsub);

        try {
            const unsub = await RepoFactory.Instance.coaches.getPromptsLibrary(this.coachId, async lib => {
                this._library = lib;

                // ensure default library
                if (!this._libraryChecked && (
                    process.appFeatures.EDITABLE_PROMPTS_ENABLED === true && !lib?.types
                    || process.appFeatures.INTERVENTIONS_ENABLED === true && !lib?.tips
                )) {
                    this._libraryChecked = true;
                    await Firebase.Instance.getFunction(CoachesFunctions.EnsurePromptsLibrary)
                        .execute();
                }
            });

            this._disposer.add(unsub, linUnsub);
        } finally {
            this._loading = false;
        }
    }

    public filterInterventions(feelings: TipsLabels[]) {
        if (!feelings) {
            return null;
        }

        const interventions: InterventionTip[] = [];
        this._library.tips?.forEach(tip => {
            feelings.forEach(feel => {
                if (tip.labels.indexOf(feel) > -1) {
                    interventions.push(tip);
                }
            });
        });

        return interventions;
    }

    public dispose() {
        this._disposer.dispose();
    }
}
