import { computed, observable, transaction } from 'mobx';
import { IDisposable, Unsubscriber } from 'common/utils/unsubscriber';
import RepoFactory from 'common/controllers/RepoFactory';
import logger from 'common/logger';
import { getEmergencyPrompts } from 'common/models/prompts/defaultPrompts';
import {
    ClientJournalEntryIded,
    UserRoles,
    ClientTipsData,
    InterventionTipsStatuses,
    InterventionTipWithStatus,
    TipsLabels,
    TipStatusExpiration,
    ClientLibraryStateIded,
    PromptsLibraryIded,
    PromptType,
    ClientLibraryState,
} from 'common/models';
import Firebase from 'common/services/firebase';
import { Coaches as CoachesFunctions } from 'common/abstractions/functions';
import {
    GoalStatusController,
    IClientGoalsController,
} from 'common/controllers/GoalStatusController';

export interface IPromptsController {
    readonly loading: boolean;

    readonly promptsList: ReadonlyArray<PromptType>;
    readonly activeById: Record<string, boolean>;

    readonly availableTips: ReadonlyArray<InterventionTipWithStatus>;

    readonly goals: IClientGoalsController;

    setTipStatus(
        status: InterventionTipsStatuses.StatusIds,
        id: string,
    ): Promise<boolean>;
    tipsByFeeling(
        feelings: { name: TipsLabels; score: number }[],
        showWillDo: boolean,
    ): InterventionTipWithStatus[];
}

export class PromptsController implements IPromptsController, IDisposable {
    @observable
    private _loading = false;

    @observable
    private _state: ClientLibraryStateIded = null;

    @observable.ref
    private _library: PromptsLibraryIded = null;

    private readonly _disposer = new Unsubscriber();

    protected _coachUid: string;
    protected _clientCardId: string;
    protected _clientUid: string;

    @observable.ref
    private _goals: GoalStatusController;

    constructor(
        private readonly journals: ReadonlyArray<ClientJournalEntryIded>,
    ) {}

    public get loading() {
        return this._loading;
    }

    @computed
    public get promptsList() {
        const prompts = this._library?.types?.filter(
            (p) => !!this.activeById[p.id],
        );
        const promptsList = prompts?.length ? prompts : getEmergencyPrompts();

        return this._loading ? null : promptsList;
    }

    @computed
    public get activeById() {
        const activeById = {};
        this._state?.prompts?.forEach((a) => {
            activeById[a.promptId] = a.active;
        });

        return activeById;
    }

    @computed
    public get availableTips() {
        if (
            !process.appFeatures.INTERVENTIONS_ENABLED ||
            !this._library?.tips?.length
        ) {
            return null;
        }

        const threeDays = 1000 * 3600 * 24 * 3;
        const now = Date.now();
        const journals = this.journals?.filter(
            (j) => j.date >= now - threeDays,
        );

        const feelings: { [key in TipsLabels]?: number } = {};

        if (!journals?.length) {
            return null;
        }

        journals.forEach((journal) => {
            journal.feelings?.forEach((feeling) => {
                if (feelings[feeling]) {
                    feelings[feeling]++;
                } else {
                    feelings[feeling] = 1;
                }
            });
        });

        const scoredFeelings = Object.keys(feelings)
            .sort((a, b) => feelings[b] - feelings[a])
            .map((feeling: TipsLabels) => ({
                name: feeling,
                score: feelings[feeling],
            }));

        const tips = this.tipsByFeeling(scoredFeelings, false)?.slice(0, 3);
        return tips;
    }

    public get goals(): IClientGoalsController {
        return this._goals;
    }

    private isTipStatusChanged = (
        tipId: string,
        status: InterventionTipsStatuses.StatusIds,
    ) => {
        const tt = this._state.tipsData?.find((t) => t.tipId === tipId);
        if (!tt) {
            return true;
        }

        if (tt.status === status) {
            return false;
        }

        // prevent setting status 'no response' to tips marked with any other status already
        // and tip response was made not so long time ago
        if (
            status === InterventionTipsStatuses.StatusIds.NoResponse &&
            tt.status &&
            tt.date > Date.now() - TipStatusExpiration
        ) {
            return false;
        }

        return true;
    };

    async setTipStatus(status: InterventionTipsStatuses.StatusIds, id: string) {
        if (!process.appFeatures.INTERVENTIONS_ENABLED) {
            throw new Error('Interventions disabled');
        }

        if (!this.isTipStatusChanged(id, status)) {
            return;
        }

        const tipsSetting: Record<string, ClientTipsData> = {};
        tipsSetting[id] = { tipId: id, status, date: null };

        try {
            this._loading = true;

            await Firebase.Instance.getFunction(
                CoachesFunctions.UpdateInterventionTips,
            ).execute({
                coachId: this._coachUid,
                client: { clientId: this._clientUid, states: tipsSetting },
                callerRole: UserRoles.Client,
            });

            return true;
        } finally {
            this._loading = false;
        }
    }

    setAccount(clientUid: string, accountId: string, coachUid: string) {
        if (this._clientUid === clientUid && this._clientCardId === accountId) {
            return;
        }

        transaction(() => {
            this._loading = null;
            this._clientUid = clientUid;
            this._clientCardId = accountId;
            this._coachUid = coachUid;

            if (process.appFeatures.GOALS_ENABLED) {
                this._goals = new GoalStatusController(
                    () => this._state,
                    this._clientUid,
                    UserRoles.Client,
                    this._coachUid,
                ).withLibrary(() => this._library);
            }
        });

        if (this._clientUid && this._clientCardId) {
            this.fetchPrompts();
        }
    }

    private async fetchPrompts() {
        this._loading = true;
        this._disposer.dispose();

        try {
            const unsub1 = await RepoFactory.Instance.coaches.getClientPrompts(
                this._coachUid,
                this._clientUid,
                this.processClientPrompts,
            );
            const unsub2 = await RepoFactory.Instance.coaches.getPromptsLibrary(
                this._coachUid,
                this.processLibrary,
            );

            this._disposer.add(unsub1);
            this._disposer.add(unsub2);
        } catch (e) {
            logger.log('Error prompts', e);
        } finally {
            this._loading = false;
        }
    }

    private processClientPrompts = (clientPrompts: ClientLibraryStateIded) => {
        if (clientPrompts !== null) {
            ClientLibraryState.migrate(clientPrompts, true);
            this._state = clientPrompts;
        }
    };

    private processLibrary = (library: PromptsLibraryIded) => {
        if (library != null) {
            this._library = library;
        }

        this._goals?.withLibrary(() => this._library);
    };

    private isStatusToShow = (status: InterventionTipsStatuses.StatusIds) => {
        if (!status) {
            return true;
        }

        return (
            status === InterventionTipsStatuses.StatusIds.WillDo ||
            status === InterventionTipsStatuses.StatusIds.NoResponse
        );
    };

    public tipsByFeeling(
        feelings: { name: TipsLabels; score: number }[],
        showAll: boolean,
    ) {
        if (
            !process.appFeatures.INTERVENTIONS_ENABLED ||
            !this._library?.tips?.length
        ) {
            return null;
        }

        const tipsWithScores: Array<
            InterventionTipWithStatus & { score: number }
        > = [];
        const tipsStatuses: Record<
            string,
            InterventionTipsStatuses.StatusIds
        > = {};
        this._state?.tipsData?.forEach((tip) => {
            if (tip.date && tip.date >= Date.now() - TipStatusExpiration) {
                tipsStatuses[tip.tipId] = tip.status;
            }
        });

        // !tipsStatuses[tip.id] equal to NoResponse status
        this._library.tips.forEach((tip) => {
            let score =
                tipsStatuses[tip.id] ===
                    InterventionTipsStatuses.StatusIds.WillDo && !showAll
                    ? 1
                    : 0;

            if (showAll || this.isStatusToShow(tipsStatuses[tip.id])) {
                feelings.forEach((feel) => {
                    if (tip.labels.indexOf(feel.name) > -1) {
                        score += feel.score;
                    }
                });
            }

            tipsWithScores.push({
                ...tip,
                score,
                status:
                    tipsStatuses[tip.id] ||
                    InterventionTipsStatuses.StatusIds.NoResponse,
            });
        });

        tipsWithScores.sort((a, b) => {
            if (b.status === InterventionTipsStatuses.StatusIds.WillDo) {
                return 1;
            }
            if (a.status === InterventionTipsStatuses.StatusIds.WillDo) {
                return -1;
            }
            return b.score - a.score;
        });

        return tipsWithScores.filter((tip) => tip.score > 0);
    }

    public dispose() {
        this._disposer.dispose();
    }
}
