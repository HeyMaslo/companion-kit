import { autorun, observable, transaction } from 'mobx';
import {
    ClientCard,
    ClientCardIded,
    ClientInviteMinPeriod,
    ClientStatus,
    CoachClientActions,
} from 'common/models';
import Firebase from 'common/services/firebase';
import { createLogger } from 'common/logger';
import { Coaches as CoachFunctions } from 'common/abstractions/functions';
import RepoFactory from 'common/controllers/RepoFactory';
import { ClientModel } from './ClientModel';
import WebClientTracker, { Events } from 'app/services/webTracker';
import { AssessmentType } from 'common/models';
import { ClientsResponse } from 'common/models/dtos/clients';

const logger = createLogger('[ClientsList]');

type ClientCardEditDiff = Omit<Partial<ClientCard>, 'status'|'clientId'|'inviteSentTime'>;
type ClientEditAssessment = { type: AssessmentType, active: boolean };

export interface IClientsController {
    readonly loading: boolean;
    readonly all: ReadonlyArray<ClientCardIded>;

    getModel(clientCardId: string): ClientModel;

    getClientsByStatus(status: ClientStatus): ReadonlyArray<ClientCardIded>;

    add(data: Partial<ClientCard>): Promise<ClientCardIded>;

    action(clientId: string, action: CoachClientActions.Edit, data: ClientCardEditDiff): Promise<ClientsResponse>;
    action(clientId: string, action: CoachClientActions.EditAssessments, data: ClientEditAssessment): Promise<ClientsResponse>;
    action(clientId: string, action: CoachClientActions.Archive | CoachClientActions.Disable | CoachClientActions.Renew | CoachClientActions.ResendInvite): Promise<ClientsResponse>;
}

const EmptyClients: ClientCardIded[] = [];
const EmptyModel = new ClientModel('', { id: '' } as ClientCardIded);

export default class ClientsController implements IClientsController {
    @observable
    private _loading = false;

    @observable
    private readonly _all: ClientCardIded[] = [];

    private _coachId: string;
    private _clientsUnsubscriber: () => void = null;
    private _unsubscribers: (() => void)[] = [];

    @observable
    private _byStatus: { [status: string]: ClientCardIded[] } = {};

    private readonly _models: { [clientId: string]: ClientModel } = { };

    constructor(private readonly getCoachId: () => string) {

        // re-fetch clients if coach id changes
        this._unsubscribers.push(autorun(() => {
            const coachId = this.getCoachId();
            if (coachId !== this._coachId) {
                this.fetchClients(coachId);
            }
            this._coachId = coachId;
        }));

        this.splitByStatus();
    }

    getModel(clientCardId: string) {
        if (!clientCardId || !this._coachId) {
            return EmptyModel;
        }

        let model: ClientModel = this._models[clientCardId];
        if (!model) {
            let card = this.getById(clientCardId);
            if (!card) {
                card = { id: clientCardId } as ClientCardIded;
            }
            model = new ClientModel(this._coachId, card);
            this._models[clientCardId] = model;
        }

        return model;
    }

    get loading() { return this._loading; }
    get all() { return this._all; }

    getClientsByStatus(status: ClientStatus) {
        return this._byStatus[status] || EmptyClients;
    }

    getById(clientId: string): ClientCardIded {
        return this._all.find(c => c.id === clientId);
    }

    private async fetchClients(coachId: string) {
        this.unsubscribeClients();

        if (!coachId) {
            return;
        }

        this._loading = true;

        logger.log('Fetching...');
        try {
            const fetchRes = await RepoFactory.Instance.clientCards.getClients(coachId, this.processClients);
            if (typeof fetchRes === 'function') {
                this._clientsUnsubscriber = fetchRes;
            } else {
                this.processClients(fetchRes);
            }
        } catch (err) {
            logger.error('Failed to fetch clients. Error:', err);
        } finally {
            this._loading = false;
        }
    }

    private unsubscribeClients() {
        if (this._clientsUnsubscriber) {
            this._clientsUnsubscriber();
            this._clientsUnsubscriber = null;
        }
    }

    private async fetchClientsIfNotSubscribed() {
        if (!this._clientsUnsubscriber) {
            await this.fetchClients(this._coachId);
        }
    }

    private processClients = (items: ClientCardIded[]) => {
        logger.log('Clients fetched items =', items.length);

        const observs = items.map(i => observable.object(i));

        ClientsController.sortClients(observs);

        transaction(() => {
            this._all.length = 0;
            this._all.push(...observs);

            this.splitByStatus();

            this._all.forEach(c => {
                const m = this._models[c.id];
                if (m) {
                    m.setClient(c);
                }
            });
        });
    }

    static sortClients(clients: ClientCard[]) {
        clients.sort((c1, c2) => (c1.email || '').localeCompare(c2.email || ''));
    }

    private splitByStatus() {
        // clear
        ClientStatus.Helper.Values.forEach(s => {
            let coll = this._byStatus[s];
            if (!coll) {
                coll = [];
                this._byStatus[s] = coll;
            } else {
                coll.length = 0;
            }
        });

        // fill
        this._all.forEach(c => {
            this._byStatus[c.status || ClientStatus.Invited].push(c);
        });
    }

    async add(data: Partial<ClientCard>): Promise<ClientCardIded> {
        try {
            const client = await Firebase.Instance.getFunction(CoachFunctions.AddClient)
                .execute(data);

            WebClientTracker.Instance?.trackEvent(Events.AddClient);

            return client;

        } catch (err) {
            logger.error('Failed to add client. Error:', err);

            throw err;
        }
    }

    async action(clientId: string, action: CoachClientActions, data?: ClientCardEditDiff | ClientEditAssessment): Promise<ClientsResponse> {
        const card = this.getById(clientId);
        if (action === CoachClientActions.ResendInvite) {
            const now = new Date().getTime();
            if (now - card.inviteSentTime < ClientInviteMinPeriod) {
                throw new Error('Invite has been sent recently, please wait for some time and try again');
            }
        }

        const result = await Firebase.Instance.getFunction(CoachFunctions.ClientAction)
            .execute({
                clientCardId: clientId,
                action: action,
                data: action === CoachClientActions.Edit ? data as ClientCardEditDiff : null,
                assessment: action === CoachClientActions.EditAssessments ? data as ClientEditAssessment : null,
            });

        await this.fetchClientsIfNotSubscribed();

        return result;
    }

    dispose() {
        this._unsubscribers.forEach(u => u());
        this._unsubscribers.length = 0;

        this.unsubscribeClients();

        // dispose models
        Object.values(this._models).forEach(m => m.dispose());
    }
}
