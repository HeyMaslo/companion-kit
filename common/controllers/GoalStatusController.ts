import { transaction } from 'mobx';
import { ThrottleProcessor } from 'common/utils/throttle';
import { GoalType, UserRoles, GoalStatus, ClientGoalState, ClientLibraryState, PromptsLibrary } from 'common/models';
import Firebase from 'common/services/firebase';
import { Coaches as CoachesFunctions } from 'common/abstractions/functions';
import { transferFields } from 'common/utils/fields';
import logger from 'common/logger';
import { IItemsCRUDController, ItemsCRUDController } from './ItemsCRUDController';

export interface IClientGoalsController {
    readonly types: ReadonlyArray<GoalType>;

    getState(id: string): Readonly<ClientGoalState>;
    setStatus(id: string, status: GoalStatus): void;
}

export interface IGoalsController extends IClientGoalsController {
    readonly library: IItemsCRUDController<GoalType>;
}

const EmptyArray: any[] = [];

export class GoalStatusController implements IGoalsController {

    private readonly _goalsStateSubmitter: ThrottleProcessor<{ id: string, status: GoalStatus, backup?: GoalStatus }>;

    private readonly _goalsCrud = new ItemsCRUDController<GoalType>(
        () => this.types,
        dto => Firebase.Instance.getFunction(CoachesFunctions.UpdateGoals)
            .execute({
                client: {
                    clientId: this.clientId,
                    ...dto,
                },
            }),
        (from, to) => transferFields(from, null, to, 'text'),
    );

    // TODO use this
    private _library: () => PromptsLibrary;

    constructor(
        readonly _states: () => ClientLibraryState,
        readonly clientId: string,
        readonly callerRole?: UserRoles.Client | UserRoles.Coach,
        readonly coachId?: string,
    ) {
        this._goalsStateSubmitter = new ThrottleProcessor(this._submitGoalsDiff);
    }

    withLibrary(lib: () => PromptsLibrary) {
        this._library = lib;
        return this;
    }

    private get state() { return this._states(); }
    public get types() { return this.state?.library?.goals || EmptyArray; }

    public get library() { return this._goalsCrud; }

    public getState = (id: string) => this.state?.goals?.find(g => g.goalId === id);

    public setStatus = (id: string, status: GoalStatus) => {
        const type = this.types?.find(g => g.id === id);
        if (!type) {
            throw new Error('Goal wasn\'t found for id = ' + id);
        }

        let backup: GoalStatus;
        transaction(() => {
            if (!this.state.goals) {
                this.state.goals = [];
            }

            let e = this.state.goals.find(gs => gs.goalId === id);
            if (!e) {
                e = {
                    goalId: id,
                    date: Date.now(),
                    status: status,
                };
                this.state.goals.push(e);
                backup = GoalStatus.Seen;
            } else {
                backup = e.status;
                e.status = status;
            }
        });

        this._goalsStateSubmitter.push({ id, status, backup });
    }

    private _submitGoalsDiff = async (diffs: { id: string, status: GoalStatus, backup?: GoalStatus }[]) => {
        if (!diffs?.length) {
            return;
        }

        const res: Record<string, Partial<ClientGoalState>> = { };
        diffs.forEach(d => {
            res[d.id] = {
                goalId: d.id,
                status: d.status,
            };
        });

        try {
            await Firebase.Instance.getFunction(CoachesFunctions.UpdateGoals)
                .execute({
                    client: {
                        clientId: this.clientId,
                        states: res,
                    },
                    callerRole: this.callerRole,
                    coachId: this.coachId,
                });
        } catch (err) {
            transaction(() => {
                diffs.forEach(d => {
                    if (d.backup) {
                        const existing = this.state.goals?.find(gs => gs.goalId === d.id);
                        if (existing) {
                            existing.status = d.backup;
                        }
                    }
                });
            });

            logger.error(err);
        }
    }

}
