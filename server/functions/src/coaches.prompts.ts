import { v4 as uuid4 } from 'uuid';
import { UserRoles } from 'common/models';
import { transferFields, transferChangedFields } from 'common/utils/fields';
import {
    PromptType,
    PromptsLibraryIded,
    PromptsLibrary,
    ClientLibraryState,
    InterventionTip,
    ClientTipsData,
    GoalType,
    ClientGoalState,
    GoalStatus,
    ClientPromptState,
} from 'common/models/prompts';
import * as PromptsDtos from 'common/models/dtos/prompts';
import { Coaches as CoachesFunctions } from 'common/abstractions/functions';
import { FunctionFactory } from 'server/utils/createFunction';
import { Repo } from 'server/services/db';
// import { pushNotifications } from 'server/services/notifications';
import { FeatureSettings } from './services/config';
import AppHttpError from './utils/AppHttpError';
import { NotificationTypes } from 'common/models/Notifications';
import { getDefaultPrompts, getDefaultTips, getDefaultGoals } from 'common/models/prompts/defaultPrompts';

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;
type BaseType<TKey extends keyof PromptsLibrary> = ArrayElement<PromptsLibrary[TKey]>;
type ClientStateResult<TState> = { affected: Record<string, TState>, diff: Partial<ClientLibraryState> };

abstract class PromptsBaseUpdater<T extends BaseType<TKey>, TKey extends keyof PromptsLibrary, TState> {

    request: PromptsDtos.BaseRequest<T, TState>;
    library: PromptsLibraryIded;
    clientState: ClientLibraryState;
    userRole: UserRoles;

    constructor(
        readonly uid: string,
        readonly typesKey: TKey,
    ) { }

    protected get allowedRoleForClientStateUpdate(): UserRoles[] { return [UserRoles.Coach]; }

    protected abstract validateContent(p: T, namePrefix: string, errs: AppHttpError.InvalidArgDescription[]): boolean;

    protected abstract updateType(diff: T, target: T): void;

    protected createType(p: T): T {
        p.id = uuid4();
        return p;
    }

    private updatePromptTypes(
        existing: T[],
        data: PromptsDtos.BaseRequest<T, TState>,
    ): T[] {
        const affected: T[] = [];
        const errs: AppHttpError.InvalidArgDescription[] = [];
        if (data.add != null) {
            data.add.forEach((p, i) => {
                if (this.validateContent(p, `add[${i}].`, errs)) {
                    p = this.createType(p);
                    existing.push(p);
                    affected.push(p);
                }
            });
        }

        if (data.update != null) {
            data.update.forEach((p, i) => {
                const ep = existing.find(eep => eep.id === p.id);
                if (!ep) {
                    errs.push({ name: `update[${i}]`, error: 'item_not_found' });
                } else if (this.validateContent(p, `update[${i}].`, errs)) {
                    this.updateType(p, ep);
                    affected.push(ep);
                }
            });
        }

        if (data.remove != null) {
            data.remove.forEach((pid, i) => {
                const ei = existing.findIndex(ep => ep.id === pid);
                if (ei < 0) {
                    errs.push({ name: `remove[${i}]`, error: 'item_not_found' });
                } else {
                    const [removed] = existing.splice(ei, 1);
                    affected.push(removed);
                }
            });
        }

        if (errs.length > 0) {
            throw AppHttpError.InvalidArguments(...errs);
        }

        return affected;
    }

    private async updateLibrary() {
        let libraryId: string;
        if (!this.request.callerRole || this.request.callerRole === UserRoles.Coach) {
            libraryId = this.uid;
        } else if (this.request.coachId) {
            libraryId = this.request.coachId;
        } else {
            throw AppHttpError.InvalidArguments({ name: 'coachId', expected: '<not empty>' });
        }

        let needCreate = false;
        let existing = await Repo.Coaches.getPromptsLibrary(libraryId);
        if (!existing || !existing[this.typesKey]) {
            needCreate = true;
            existing = {
                id: null,
                tips: null,
                types: null,
                goals: null,
            };
            existing[this.typesKey] = [];
        }

        const arr = existing[this.typesKey] as T[];
        const res = this.updatePromptTypes(arr, this.request);

        if (needCreate || res.length > 0) {
            existing = await Repo.Coaches.updatePromptsLibrary(libraryId, {
                [this.typesKey]: existing[this.typesKey],
            });
        }

        this.library = existing;

        return res;
    }

    private async updateClient() {
        const data = this.request?.client;
        if (!data || !data.clientId) {
            return null;
        }

        if (!data.states) {
            data.states = { };
        }

        if (this.allowedRoleForClientStateUpdate.every(r => !UserRoles.Helper.contains(this.userRole, r))) {
            throw AppHttpError.NoPermission('Client state update is not allowed for role: '
                + UserRoles.Helper.toString(this.userRole)
                + ', but allowed: '
                + this.allowedRoleForClientStateUpdate.map(r => UserRoles.Helper.toString(r)).join(),
            );
        }

        let needUpdate = false;

        let existing = await Repo.Coaches.getClientPrompts(this.library.id, data.clientId);
        if (!existing) {
            needUpdate = true;
            existing = {
                id: null,
                prompts: [],
                goals: [],
                tipsData: [],
            };
        }

        if (!existing.library) {
            existing.library = {
                types: [],
                tips: [],
                goals: [],
            };
        }

        let types = existing.library[this.typesKey] as T[];
        if (!types) {
            existing.library[this.typesKey] = [];
            types = existing.library[this.typesKey] as T[];
        }

        const affectedTypes = this.updatePromptTypes(types, data);
        if (affectedTypes.length > 0) {
            needUpdate = true;
        }

        this.clientState = existing;

        const result = this.updateClientState();
        // console.log('Client update state request: ', data, '; result:', result);
        if (needUpdate || (result?.affected && Object.keys(result.affected).length > 0)) {
            const diff: Partial<ClientLibraryState> = { ...result.diff };
            if (affectedTypes.length > 0) {
                diff.library = existing.library;
            }

            this.clientState = await Repo.Coaches.updateClientPrompts(this.library.id, data.clientId, diff);
        }

        return { types: affectedTypes, states: result.affected };
    }

    protected abstract updateClientState(): ClientStateResult<TState>;

    protected async postProcess(): Promise<void> { /* no-op */ }

    async update(data: PromptsDtos.BaseRequest<T, TState>): Promise<PromptsDtos.BaseResponse<T, TState> & { error?: any }> {
        this.request = data;

        const user = await Repo.Users.getUserById(this.uid);
        this.userRole = user.roles;

        if (!UserRoles.Helper.contains(this.userRole, this.request.callerRole || UserRoles.Coach)) {
            throw AppHttpError.NoPermission('User Role mismatches callerRole');
        }

        const affected = await this.updateLibrary();
        const clientAffected = await this.updateClient();

        let postProcessError = null;
        try {
            await this.postProcess();
        } catch (err) {
            console.warn('Failed to postProcess on', this.constructor?.name);
            console.error(err);
            postProcessError = err;
        }

        return {
            affected: affected,
            clientAffected: clientAffected && {
                types: clientAffected.types,
                states: clientAffected.states,
            },
            error: postProcessError,
        };
    }
}

class PromptsUpdater extends PromptsBaseUpdater<PromptType, 'types', ClientPromptState> {
    constructor(uid: string) {
        super(uid, 'types');
    }

    protected get allowedRoleForClientStateUpdate(): UserRoles[] { return [UserRoles.Client, UserRoles.Coach]; }

    protected updateType(from: PromptType, to: PromptType) {
        transferFields(from, null, to, 'text', 'categoryId');
    }

    protected validateContent(p: PromptType, namePrefix: string, errs: AppHttpError.InvalidArgDescription[]): boolean {
        let valid = true;
        // allow empty category
        // if (!p.categoryId) {
        //     errs.push({ name: `${namePrefix}categoryId`, expected: 'not_empty' });
        //     valid = false;
        // }
        if (!p.text) {
            errs.push({ name: `${namePrefix}.text`, expected: 'not_empty' });
            valid = false;
        }
        return valid;
    }

    protected updateClientState(): ClientStateResult<ClientPromptState> {
        const data = this.request.client;

        if (!this.clientState.prompts) {
            this.clientState.prompts = [];
        }

        const affected: Record<string, ClientPromptState> = { };

        // migration
        if (ClientLibraryState.migrate(this.clientState)) {
            affected.migration = null;
        }

        Object.keys(data.states).forEach(id => {
            const updateItem = data.states[id];
            if (!updateItem.promptId) {
                updateItem.promptId = id;
            }

            let existingItem = this.clientState.prompts.find(pr => pr.promptId === updateItem.promptId);
            const libraryExisting = this.library.types.find(lp => lp.id === updateItem.promptId);

            if (!libraryExisting) {
                if (existingItem) {
                    const i = this.clientState.prompts.indexOf(existingItem);
                    this.clientState.prompts.splice(i, 1);
                    affected[id] = null;
                }
                return;
            }

            if (!existingItem) {
                existingItem = {
                    promptId: id,
                    active: updateItem.active || false,
                };
                this.clientState.prompts.push(existingItem);
                affected[id] = existingItem;
            } else {
                if (transferChangedFields(updateItem, existingItem, 'active')) {
                    affected[id] = existingItem;
                }
            }
        });

        return { affected, diff: { prompts: this.clientState.prompts } };
    }
}

class InternventionTipsUpdater extends PromptsBaseUpdater<InterventionTip, 'tips', ClientTipsData> {
    constructor(uid: string) {
        super(uid, 'tips');
    }

    protected get allowedRoleForClientStateUpdate(): UserRoles[] { return [UserRoles.Client]; }

    protected validateContent(p: InterventionTip, namePrefix: string, errs: AppHttpError.InvalidArgDescription[]): boolean {
        let valid = true;
        // allow empty category
        // if (!p.categoryId) {
        //     errs.push({ name: `${namePrefix}categoryId`, expected: 'not_empty' });
        //     valid = false;
        // }
        if (!p.text) {
            errs.push({ name: `${namePrefix}.text`, expected: 'not_empty' });
            valid = false;
        }

        if (!p.labels) {
            errs.push({ name: `${namePrefix}.labels`, expected: 'not_empty' });
            valid = false;
        }

        return valid;
    }

    protected updateType(from: InterventionTip, to: InterventionTip): void {
        transferFields(from, null, to, 'text', 'labels');
    }

    protected updateClientState(): ClientStateResult<ClientTipsData> {
        const data = this.request.client;

        if (!this.clientState.tipsData) {
            this.clientState.tipsData = [];
        }

        const affected: Record<string, ClientTipsData> = { };
        const now = Date.now();

        Object.keys(data.states).forEach(id => {
            const updateItem = data.states[id];
            if (!updateItem.tipId) {
                updateItem.tipId = id;
            }

            const existingIndex = this.clientState.tipsData.findIndex(pr => pr.tipId === updateItem.tipId);
            const libraryExisting = this.library.tips?.find(lp => lp.id === updateItem.tipId);

            let existingItem = this.clientState.tipsData[existingIndex];
            let changed = false;

            if (updateItem && existingItem) {
                // if (transferChangedFields(updateItem, existingItem, 'active')) {
                //     changed = true;
                // }
                if (ClientTipsData.changeStatus(existingItem, updateItem.status, now)) {
                    changed = true;
                }
            } else if (updateItem && libraryExisting && !existingItem) {
                changed = true;
                existingItem = {
                    tipId: libraryExisting.id,
                    date: now,
                    status: updateItem.status || null,
                    // active: updateItem.active || false,
                };
                this.clientState.tipsData.push(existingItem);
            }

            if (changed) {
                affected[existingItem.tipId] = existingItem;
            }
        });

        return { affected, diff: { tipsData: this.clientState.tipsData } };
    }
}

class GoalsUpdater extends PromptsBaseUpdater<GoalType, 'goals', ClientGoalState> {

    private _newTypes: GoalType[] = [];

    constructor(uid: string) {
        super(uid, 'goals');
    }

    protected get allowedRoleForClientStateUpdate(): UserRoles[] { return [UserRoles.Client, UserRoles.Coach]; }

    protected validateContent(p: GoalType, namePrefix: string, errs: AppHttpError.InvalidArgDescription[]): boolean {
        let valid = true;
        if (!p.text) {
            errs.push({ name: `${namePrefix}.text`, expected: 'not_empty' });
            valid = false;
        }
        return valid;
    }

    protected updateType(diff: GoalType, target: GoalType): void {
        transferFields(diff, null, target, 'text');
    }

    protected createType(p: GoalType): GoalType {
        super.createType(p);
        p.date = Date.now();

        this._newTypes.push(p);

        return p;
    }

    protected updateClientState(): ClientStateResult<ClientGoalState> {
        const data = this.request.client;

        if (!this.clientState.goals) {
            this.clientState.goals = [];
        }

        const now = Date.now();
        const affected: Record<string, ClientGoalState> = { };

        Object.keys(data.states).forEach(id => {
            const updateState = data.states[id];
            if (updateState?.goalId) {
                updateState.goalId = id;
            }

            let existingState = this.clientState.goals.find(pr => pr.goalId === updateState.goalId);
            const typeExists = this.library.goals?.find(lp => lp.id === updateState.goalId)
                || this.clientState.library?.goals?.find(lp => lp.id === updateState.goalId);

            if (!typeExists) { // trying to update a state with non-existing library type
                if (existingState) {
                    affected[id] = null;
                    const i = this.clientState.goals.indexOf(existingState);
                    this.clientState.goals.splice(i, 1);
                }
                return;
            }

            let changed = false;
            if (existingState == null) {
                existingState = {
                    goalId: updateState.goalId,
                    date: now,
                    status: updateState.status || GoalStatus.New,
                    active: updateState.active || false,
                };

                this.clientState.goals.push(existingState);
                changed = true;
            } else {
                if (transferChangedFields(updateState, existingState, 'active')) {
                    changed = true;
                }
                if (ClientGoalState.changeStatus(existingState, updateState.status, now)) {
                    changed = true;
                }
            }

            if (changed) {
                affected[existingState.goalId] = existingState;
            }
        });

        return { affected, diff: { goals: this.clientState.goals }};
    }

    protected async postProcess() {
        if (!this.request?.client?.clientId) {
            // action was not directed to the client
            return;
        }

        if (this._newTypes.length > 0) {
            // 1 or more new goals has been added
            // await pushNotifications([{
            //     uid: this.request.client.clientId,
            //     data: {
            //         body: 'Your therapist has created a new goal for you. Check it out!',
            //         subtitle: 'New goals added',
            //         data: {
            //             type: NotificationTypes.NewGoals,
            //         },
            //     },
            // }]);
        }
    }
}

export const PromptsEndpoint = (FeatureSettings.EditablePrompts || FeatureSettings.Interventions || FeatureSettings.Goals) && new FunctionFactory(CoachesFunctions.PromptsGeneralEndpoint)
    .create(async (data, ctx) => {
        if (PromptsDtos.RequestDto.isEnsureLibrary(data)) {
            await ensureLibrary(ctx.auth.uid);
            return { ok: true, type: 'library' };
        }

        if (FeatureSettings.EditablePrompts && PromptsDtos.RequestDto.isPrompts(data)) {
            const res = await new PromptsUpdater(ctx.auth.uid)
                .update(data);
            return {
                ...res,
                type: 'prompts',
            };
        }

        if (FeatureSettings.Interventions && PromptsDtos.RequestDto.isTips(data)) {
            const res = await new InternventionTipsUpdater(ctx.auth.uid)
                .update(data);
            return {
                ...res,
                type: 'tips',
            };
        }

        if (FeatureSettings.Goals && PromptsDtos.RequestDto.isGoals(data)) {
            const res = await new GoalsUpdater(ctx.auth.uid)
                .update(data);
            return {
                ...res,
                type: 'goals',
            };
        }

        throw AppHttpError.InvalidArguments({ error: 'Unsupported DTO type', name: 'type', got: data.type });
    });

async function ensureLibrary(uid: string) {
    const user = await Repo.Users.getUserById(uid);
    if (!UserRoles.Helper.contains(user.roles, UserRoles.Coach)) {
        throw new Error('Only coach can ensure prompts library');
    }

    let changed = false;
    let library: PromptsLibrary = await Repo.Coaches.getPromptsLibrary(uid);
    if (!library) {
        library = {
            tips: null,
            goals: null,
            types: null,
        };
        changed = true;
    }

    if (FeatureSettings.EditablePrompts && !library.types) {
        library.types = getDefaultPrompts() || [];
        changed = true;
    }

    if (FeatureSettings.Interventions && !library.tips) {
        library.tips = getDefaultTips() || [];
        changed = true;
    }

    if (FeatureSettings.Goals && !library.goals) {
        library.goals = getDefaultGoals() || [];
        changed = true;
    }

    if (changed) {
        await Repo.Coaches.updatePromptsLibrary(uid, library);
    }
}
