import { autorun, observable, transaction, computed, reaction } from 'mobx';

import { UserRoles, UserProfile, ClientProfile, ClientAccountIded, ClientStatus } from 'common/models';
import { IUserController as IUserControllerBase } from 'common/abstractions/controlllers/IUserController';
import { UserController as UserControllerBase, logger } from 'common/controllers/UserController';
import RepoFactory from 'common/controllers/RepoFactory';
import FullUser, { ClientProfileFull } from 'common/models/FullUser';
import Identify from 'common/models/Identify';
import NamesHelper from 'common/utils/nameHelper';
import Lazy from 'common/utils/lazy';
import StorageAsync from 'src/services/StorageAsync';
import Firebase from 'common/services/firebase';
import { Users as UsersFunctions } from 'common/abstractions/functions';
import MobileTracker from 'src/services/mobileTracker';
import * as Events from 'src/services/mobileTracker.events';

import { NotificationsController } from 'src/controllers/Notifications';
import { AssessmentsController, IAssessmentsController } from 'src/controllers/Assessments';
import { RecordsController } from 'common/controllers/RecordsController';
import { IPromptsController, PromptsController } from 'src/controllers/Prompts';
import { getDayIndex } from 'src/helpers/onboarding';
import { IAuthController } from './Auth';
import { IJournalController, JournalController } from './Journal';
import { AuthUser } from 'common/abstractions/controlllers/IAuthController';
import { StaticTipItemIded } from 'common/models/StaticTips';
import { LocalSettingsController, ILocalSettingsController } from './LocalSettings';
import { RewardsController } from './Rewards';
import { IDocumentsController, DocumentsController } from './Documents';
import QoLController from 'common/controllers/QoLController';

type ClientUser = Identify<UserProfile> & { client?: ClientProfileFull };

type ClientAccountExtended = ClientAccountIded & {
};

export interface IUserController extends IUserControllerBase {
    readonly user: ClientUser;
    readonly displayName: string;

    readonly assessments: IAssessmentsController;
    readonly journal: IJournalController;
    readonly records: RecordsController;
    readonly recordsLastWeek: RecordsController;

    readonly activeAccount: Readonly<ClientAccountExtended>;
    readonly accounts: ReadonlyArray<ClientAccountExtended>;

    readonly documents: IDocumentsController;

    readonly notifications: NotificationsController;
    readonly localSettings: ILocalSettingsController;

    readonly prompts: IPromptsController;
    readonly staticTips: ReadonlyArray<StaticTipItemIded>;

    readonly onboardingDayIndex: number | null;
    readonly rewards?: RewardsController;

    readonly backend: QoLController;

    readonly hasSeenOnboarding: boolean;
    onboardingSeen(): void;

    acceptConsent?(option: string): Promise<boolean>;
}

const SavedUserIdKey = 'user:saved:id';

export class UserController extends UserControllerBase implements IUserController {

    @observable.ref
    private _accounts: ClientAccountExtended[] = [];

    @observable.ref
    private _activeAccount: ClientAccountExtended | false;

    private readonly _assessments = process.appFeatures.ASSESSMENTS_ENABLED === true ? new AssessmentsController() : null;

    public readonly rewards = process.appFeatures.CLIENT_REWARDS_ENABLED === true
        ? new RewardsController(
            () => this.user?.client?.journalsHistory,
            () => this.activeAccount?.id,
        ) : null;

    @observable
    private _onboardingSeen = false;

    @observable.ref
    private _staticTips: StaticTipItemIded[] = null;

    private readonly _prompts: PromptsController;
    private readonly _localSettings = new LocalSettingsController();

    private readonly _journal = new JournalController();
    private readonly _records = new Lazy(() => {
        const rs = new RecordsController();
        if (this.user && this.activeAccount) {
            rs.setClient(this.activeAccount.coachId, this.user.id, this.user.displayName);
        }
        this.disposer.add(rs.dispose, 'records');
        return rs;
    });
    private readonly _recordsLastWeek = new Lazy(() => {
        const rsw = new RecordsController();
        rsw.setLoggerName(`${this.user?.displayName || '??'}:week`);
        this.disposer.add(reaction(() => this._records.value.items, items => {
            const now = new Date().getTime();
            const weekBack = now - 3600 * 24 * 7 * 1000;
            const thisWeekItems = items.filter(i => i.date >= weekBack);
            rsw.initWithRecords(thisWeekItems);
        }, { fireImmediately: true }));
        this.disposer.add(rsw.dispose, 'recordsLastWeek');
        return rsw;
    });

    private _documents: DocumentsController;

    private readonly _backend = new Lazy(() => {
        const bk = new QoLController();
        if (this.user && this.activeAccount) {
            bk.setUser(this.user.id);
        }
        return bk;
    });

    public readonly notifications: NotificationsController;

    constructor(auth: IAuthController) {
        super(auth);

        const self = this;
        this.notifications = new NotificationsController(this._localSettings, {
            get firstName() { return self.user?.firstName; },
            get lastName() { return self.user?.lastName; },
        });

        if (process.appFeatures.EDITABLE_PROMPTS_ENABLED === true) {
            this._prompts = new PromptsController(this._journal.entries);
        }

        this.disposer.add(auth.onPreProcessUser.on(u => this.onPreProcessAuthUser(u)), 'onPreProcessAuthUser');

        // TODO: Make prettier
        this.disposer.add(autorun(() => {
            const userId = this.user?.id;
            const acccountId = (this._activeAccount && this._activeAccount.id) || null;
            const coachId = (this._activeAccount && this._activeAccount.coachId) || null;

            this._journal.setAccount(userId, acccountId, coachId);
        }));
    }

    get initializing() { return super.initializing; }

    get accountMissing() { return super.accountMissing || this.clientAccountMissing; }

    get clientAccountMissing() { return this._activeAccount === false; }

    get prompts() { return this._prompts; }
    get targetRole(): UserRoles { return UserRoles.Client; }
    get activeAccount() { return this._activeAccount || null; }
    get accounts() { return this._accounts; }
    get assessments() { return this._assessments; }
    get journal() { return this._journal; }
    get records() { return this._records.value; }
    get recordsLastWeek() { return this._recordsLastWeek.value; }

    get documents() {
        if (!this._documents) {
            this._documents = new DocumentsController();
            if (this._activeAccount) {
                this._documents?.setAccount(this._activeAccount.coachId, this._activeAccount.id);
            }
        }
        return this._documents;
    }

    get backend() { return this._backend.value; };

    get firstName() { return this.user?.firstName; }
    get lastName() { return this.user?.lastName; }

    get staticTips() { return this._staticTips; }

    get localSettings() { return this._localSettings; }

    @computed
    get displayName() { return NamesHelper.ensureFromUsers(this.user, this.auth.authUser).displayName; }

    @computed
    get onboardingDayIndex(): number | null {
        return this.user?.client && this.activeAccount && getDayIndex(this.user.client.journalsHistory);
    }

    get hasSeenOnboarding(): boolean { return this._onboardingSeen; }

    onboardingSeen(): void {
        this._onboardingSeen = true;
    }

    private async onPreProcessAuthUser(authUser: AuthUser) {
        if (authUser) {
            const savedUserId = await StorageAsync.getValue(SavedUserIdKey);
            if (savedUserId !== authUser.uid) {
                logger.log('Checking client\'s invitation, uid =', authUser.uid);
                const result = await Firebase.Instance.getFunction(UsersFunctions.TryCreateClientUser)
                    .execute();

                if (result.createdAccount) {
                    MobileTracker.Instance?.trackEvent(Events.SessionStarted);
                }

                logger.log('Invitation checked, result:', result);
            }
        } else {
            await StorageAsync.remove(SavedUserIdKey);
        }
    }

    protected async postProcessUser(user: FullUser, isUpdating?: boolean) {
        this.clientUnsubscribe();

        if (UserRoles.Helper.contains(user.roles, UserRoles.Client)) {
            let userCopy = user;

            const clientUnsub = await RepoFactory.Instance.clients.getClient(user.id, c => this.processClient(userCopy, c));
            this.disposer.add(clientUnsub, 'GETCLIENT');

            const accountsUnsub = await RepoFactory.Instance.clients.getAccounts(user.id, {}, accounts => this.processAccounts(accounts, user.id));
            this.disposer.add(accountsUnsub, 'GETACCS');

            userCopy = null;
        } else {
            logger.warn('User for email', user.email, 'does not have Client role!');
            this._activeAccount = false;
        }

        return user;
    }

    protected async onUserChanged(user: FullUser, isUpdating?: boolean) {
        if (!isUpdating && user) {
            this._records.weakValue?.setClient(this.activeAccount.coachId, this.user.id, this.user.displayName);
            this._recordsLastWeek.weakValue?.setLoggerName(`${this.user.displayName || '??'}:week`);
            this._backend.weakValue?.setUser(this.user.id);

            this._onboardingSeen = false;

            if (user) {
                await StorageAsync.setValue(SavedUserIdKey, user.id);
            }

            if (process.appFeatures.MOBILE_STATIC_TIPS_ENABLED) {
                this.disposer.add(await RepoFactory.Instance.staticTips.get(tips => {
                    this._staticTips = tips?.filter(t => !t.disabled);
                    logger.log(`Loaded ${this._staticTips?.length} of ${tips?.length} STATIC TIPS`);
                }), 'staticTips');
            }

            await this._localSettings.load(user.id);
            await this.notifications.initAsync();
        }
    }

    private processClient = (u: FullUser, client: Identify<ClientProfile>) => {
        const user = u || this.user;
        const action = !!user.client
            ? 'Updating'
            : 'Initializing';

        logger.log(`${action} user's client info with:`, client);
        user.client = client as Identify<ClientProfileFull>;
    }

    private async processAccounts(accounts: ClientAccountIded[], userUid: string) {
        transaction(() => {
            this._accounts = accounts || [];
            this._activeAccount = this._accounts.find(s => s.status === ClientStatus.Active) || false;
        });

        let id: string;
        if (this._activeAccount) {
            id = this._activeAccount.id;

            this._prompts?.setAccount(userUid, id, this._activeAccount.coachId);

            this._assessments?.initialize(this._activeAccount, userUid);

            this._documents?.setAccount(this._activeAccount.coachId, this._activeAccount.id);

            // logger.log(' ===================== \r\n\r\n ASSESSMENT STATUS', this._activeAccount.assessments);
        } else {
            id = 'null';
        }

        logger.log('Accounts: total =', this._accounts.length, '; active acc id =', id);
    }

    private clientUnsubscribe() {
        this.disposer.execute('GETCLIENT');
        this.disposer.execute('GETACCS');
    }

    public acceptConsent = process.appFeatures.MOBILE_SHOW_CONSENT && (async (option: string) => {
        try {
            if (!this.user) {
                throw Error('Cannot update user, no auth session');
            }

            if (!option) {
                throw new Error('acceptConsent: an option should be selected');
            }

            await Firebase.Instance.getFunction(UsersFunctions.AcceptConsent)
                .execute({ option });

            if (!this.user.client.consentAccepted) {
                // temporary save successful result
                // it should be overwritten a bit later by database callback
                this.user.client.consentAccepted = { option, date: Date.now() };
            }

            return true;
        } catch (err) {
            logger.error('Failed to edit user, error', err);
            return false;
        }
    });

    dispose() {
        super.dispose();

        this._assessments?.dispose();
        this._journal.dispose();
        this._prompts?.dispose();
        this._documents?.dispose();
        this.notifications.dispose();
    }
}
