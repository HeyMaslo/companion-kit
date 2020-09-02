import { computed, observable } from 'mobx';
import { CoachUser, IAuthController } from './Auth';
import { UserRoles, CoachProfile, ClientStatus } from 'common/models';
import ClientsController, { IClientsController } from './Clients';
import { IUserController as IUserControllerBase } from 'common/abstractions/controlllers/IUserController';
import { UserController as UserControllerBase, logger } from 'common/controllers/UserController';
import FullUser from 'common/models/FullUser';
import RepoFactory from 'common/controllers/RepoFactory';
import WebClientTracker from 'app/services/webTracker';
import Env from 'app/constants/env';
import { TimeObservable } from 'common/utils/timeObservable';
import { userHasAccess, getMaxClients } from 'common/helpers/billing';
import { Users as UsersFunctions } from 'common/abstractions/functions';
import Firebase from 'common/services/firebase';
import { PromptsController, IPromptsController } from './PromptsLibrary';
import { transferChangedFields } from 'common/utils/fields';
// import { Plans, PlanUI } from 'common/models';

export interface IUserController extends IUserControllerBase {
    readonly user: CoachUser;
    readonly clients: IClientsController;
    readonly prompts: IPromptsController;

    readonly firstName: string;
    readonly freeAccess: boolean;
    readonly paymentRequired: boolean;
    readonly clientsLimitReached: boolean;

    sendLinktoDesktop(): Promise<boolean>;
    editCoachProfile(diff: Partial<Pick<CoachProfile, 'officeNumber'>>): Promise<void>;
}

export class UserController extends UserControllerBase implements IUserController {

    private readonly _clients = new ClientsController(() => this.user && this.user.id);

    @observable.ref
    private _prompts: PromptsController = null;

    private _timer = new TimeObservable(1000 * 60);

    constructor(auth: IAuthController) {
        super(auth);
    }

    get targetRole(): UserRoles { return UserRoles.Coach; }

    get clients() { return this._clients; }

    get firstName() { return (this.user && (this.user.firstName || this.user.displayName)) || '?'; }

    get freeAccess() { return !!this.user && this.user.freeAccess; }

    @computed
    get clientsLimitReached() {
        const maxClients = getMaxClients(this.user);
        if (maxClients === 'unlimited') {
            return false;
        }

        const clients = this.clients.all.filter(c => c.status === ClientStatus.Active || c.status === ClientStatus.Invited);
        return clients.length >= maxClients;
    }

    protected get paymentDisabled() { return Env.PaymentDisabled; }

    @computed
    get paymentRequired() {
        return !userHasAccess(this.user, this._timer.now);
    }

    public get prompts(): IPromptsController { return this._prompts; }

    protected async postProcessUser(user: FullUser, isUpdating?: boolean) {
        this.disposer.execute('COACH');

        WebClientTracker.Instance.updateUserId(user.id);

        if (UserRoles.Helper.contains(user.roles, UserRoles.Coach)) {
            let userTemp = user;
            const unsub = await RepoFactory.Instance.coaches.getCoach(user.id, c => this.processCoach(userTemp, c));
            this.disposer.add(unsub, 'COACH');
            userTemp = null;

            if (process.appFeatures.EDITABLE_PROMPTS_ENABLED
                || process.appFeatures.INTERVENTIONS_ENABLED
                || process.appFeatures.GOALS_ENABLED
            ) {
                if (!isUpdating) {
                    this._prompts = new PromptsController(user.id);
                }
            }
        }

        return user;
    }

    private processCoach = (u: FullUser, c: CoachProfile) => {
        const user = u || this.user;

        const action = !!user.coach
            ? 'Updating'
            : 'Initializing';
        logger.log(action, 'user\'s coach info with:', c);
        user.coach = c;
    }

    public async editCoachProfile(diff: Partial<Pick<CoachProfile, 'officeNumber'>>): Promise<void> {
        const data: typeof diff = {
            officeNumber: this.user?.coach?.officeNumber || '',
        };

        if (!transferChangedFields(diff, data, 'officeNumber')) {
            return;
        }

        try {
            if (!this.user) {
                throw Error('Cannot update user, no auth session');
            }

            await Firebase.Instance.getFunction(UsersFunctions.UpdateCoachProfile)
                .execute(data);

            // logger.log('Successfully updated user with diff:', effectiveDiff);
        } catch (err) {
            logger.error('Failed to edit user, error', err);
        }
    }

    dispose() {
        super.dispose();

        this._clients.dispose();
        this._timer.dispose();
        this._prompts?.dispose();
    }

    public async sendLinktoDesktop() {
        try {
            const { result } = await Firebase.Instance.getFunction(UsersFunctions.SendLinktoDesktop)
                .execute();

            return result;
        } catch (err) {
            logger.warn('Error during sending link to desktop');
            return false;
        }
    }

}
