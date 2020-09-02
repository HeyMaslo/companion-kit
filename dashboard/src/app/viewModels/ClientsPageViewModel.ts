import { observable, computed } from 'mobx';
import * as ViewModels from 'common/viewModels';
import { ClientStatus, CoachClientActions, ClientCardIded, ClientCard } from 'common/models';
import AppController from 'app/controllers';
import Notifications from './NotificationsViewModel';
import Lazy from 'common/utils/lazy';
import History from 'app/services/history';
import * as Routes from 'app/constants/routes';
import { computedAsync } from 'computed-async-mobx';
import { arrayCompareG } from 'common/utils/mathx';
import EnumHelper from 'common/utils/enumHelper';
import { SortingFunction } from 'common/utils/functions';

// const CientStatusEnumStrings = {
//     get [ClientStatus.Active]() { return Localization.Current.ClientStatuses.Active; },
//     get [ClientStatus.Invited]() { return Localization.Current.ClientStatuses.Invited; },
//     get [ClientStatus.Inactive]() { return Localization.Current.ClientStatuses.Inactive; },
//     get [ClientStatus.Archived]() { return 'archived_disabled'; },
// };

export enum ClientsSortingTypes {
    NewestFirst,
    RecentCheckIns,
    WorstMoodFirst,
    BestMoodFirst,
}

const ClientStatusesToDisplay = [ClientStatus.Active, ClientStatus.Invited, ClientStatus.Inactive];

export namespace ClientsSortingTypes {
    export const Helper = new EnumHelper<ClientsSortingTypes>(ClientsSortingTypes, {
        [ClientsSortingTypes.NewestFirst]: 'Newest first',
        [ClientsSortingTypes.RecentCheckIns]: 'Recent check-ins',
        [ClientsSortingTypes.WorstMoodFirst]: 'Worst mood first',
        [ClientsSortingTypes.BestMoodFirst]: 'Best mood first',
    });

    export function sortByStatus<T extends { status: ClientStatus }>(c1: T, c2: T) {
        return ClientStatusesToDisplay.indexOf(c1.status) - ClientStatusesToDisplay.indexOf(c2.status);
    }

    function compareNumbers(d1: number, d2: number, reversed = false) {
        if (!d1 && d2) return 1;
        if (d1 && !d2) return -1;
        return reversed ? (d2 - d1) : (d1 - d2);
    }

    export function getSortingFunction(this: void, type: ClientsSortingTypes): SortingFunction<ClientItemViewModel> {
        switch (type) {
            case ClientsSortingTypes.NewestFirst: {
                return (i1, i2) => sortByStatus(i1, i2) || (i2.statusChangedDate - i1.statusChangedDate);
            }

            case ClientsSortingTypes.RecentCheckIns: {
                return (i1, i2) => sortByStatus(i1, i2) || (i2.lastCheckInDate - i1.lastCheckInDate);
            }

            case ClientsSortingTypes.WorstMoodFirst: {
                return (i1, i2) => sortByStatus(i1, i2) || compareNumbers(i1.lastCheckInMood, i2.lastCheckInMood);
            }

            case ClientsSortingTypes.BestMoodFirst: {
                return (i1, i2) => sortByStatus(i1, i2) || compareNumbers(i1.lastCheckInMood, i2.lastCheckInMood, true);
            }

            default: {
                return sortByStatus;
            }
        }
    }
}

const instance = new Lazy(() => new ClientsPageViewModel());

export default class ClientsPageViewModel {

    static get Instance() { return instance.value; }

    public readonly sortingType = new ViewModels.Select<ClientsSortingTypes>(ClientsSortingTypes.Helper.Values, i => ClientsSortingTypes.Helper.valueToString(i));

    @computed
    private get clientCards() {
        const arr = AppController.Instance.User.clients.all
            .filter(c => ClientStatusesToDisplay.includes(c.status));

        return arr;
    }

    @computed
    get clients() {
        return this.clientCards.map(cc => new ClientItemViewModel(cc));
    }

    @computed
    get clientsSorted() {
        // console.log('clientsSorted sorting ......');
        return this.clients.slice()
            .sort(ClientsSortingTypes.getSortingFunction(this.sortingType.selectedItem));
    }

    get loading() {
        return AppController.Instance.User.clients.loading;
    }

    get inProgress() { return this.clients.some(c => c.inProgress); }
}

export class ClientItemViewModel {
    @observable
    private _inProgress: boolean = false;

    private readonly _avatarUrlLoader = computedAsync(null, async () => {
        const info = await AppController.Instance.User.getUserPublicInfo(this.card.clientId);
        return info?.photoURL;
    });

    constructor(readonly card: ClientCardIded) {
    }

    @computed
    private get model() {
        return AppController.Instance.User.clients.getModel(this.card.id);
    }

    get id() { return this.card.id; }
    get inProgress() { return this._inProgress; }

    @computed
    get avatarUrl() {
        return this._avatarUrlLoader.value;
    }

    @computed
    get lastCheckInDate() {
        const maxDateItem = arrayCompareG(this.model.journal.entries, (j, res) => j.date >= res.date);
        const t = maxDateItem?.date ? maxDateItem.date : 0;
        // console.log('=======', this.displayName, 'lastCheckInDate', t);
        return t;
    }

    @computed
    get lastCheckInMood() {
        const maxDateItem = arrayCompareG(this.model.journal.entries, (j, res) => j.date >= res.date);
        const m = maxDateItem?.mood ? maxDateItem.mood : 0;
        // console.log('=======', this.displayName, 'lastCheckInMood', m);
        return m;
    }

    @computed
    get statusChangedDate() {
        const t = this.card.date || this.card.inviteSentTime;
        // console.log('=======', this.displayName, 'statusChangedDate', t);
        return t;
    }

    get displayName() {
        return this.model.displayName;
    }

    get status() { return this.card.status; }

    renewClient = async () => {
        if (AppController.Instance.User.clientsLimitReached && !process.appFeatures.BILLING_DISABLED) {
            AppController.Instance.PromptModal.openModal({
                typeModal: 'negative',
                title: 'Upgrade Needed',
                message: 'We’re sorry, but you can’t add any more clients with your current plan. Please, upgrade to another one.',
                confirmText: 'Upgrade',
                rejectText: 'Cancel',
                onConfirm: () => {
                    History.push(Routes.Pricing);
                },
                onReject: () => {
                    AppController.Instance.PromptModal.closeModal();
                },
            });
        } else {
            const client = this.checkClient(this.card.id, ClientStatus.Inactive);
            await this.wrapError(async () => {
                await AppController.Instance.User.clients
                    .action(client.id, CoachClientActions.Renew);
                // this.statusSelect.selectedItem = ClientStatus.Active;
            });
        }
    }

    // private deleteInvitation = async () => {
    //     const client = this.checkClient(this.card.id, ClientStatus.Invited);
    //     await this.wrapError(() => AppController.Instance.User.clients
    //         .action(client.id, CoachClientActions.Archive));
    // }

    resendInvitation = async () => {
        const client = this.checkClient(this.card.id, ClientStatus.Invited);
        await this.wrapError(() => AppController.Instance.User.clients
            .action(client.id, CoachClientActions.ResendInvite));
    }

    private archiveClient = async () => {
        const client = this.checkClient(this.card.id, ClientStatus.Inactive);
        await this.wrapError(() => AppController.Instance.User.clients
            .action(client.id, CoachClientActions.Archive));
    }

    promptToDeleteClient = () => {
        AppController.Instance.PromptModal.openModal({
            typeModal: 'negative',
            title: 'Do you really want *to delete client?*',
            message: '',
            confirmText: 'Delete',
            rejectText: 'decline',
            onConfirm: () => {
                this.archiveClient();
            },
            onReject: () => {
                History.replace(Routes.Clients);
            },
        });
    }

    // promptToDeleteInvite = () => {
    //     AppController.Instance.PromptModal.openModal({
    //         typeModal: 'negative',
    //         title: 'Do you really want *to delete invite?*',
    //         message: '',
    //         confirmText: 'Delete',
    //         rejectText: 'decline',
    //         onConfirm: async () => {
    //             await this.deleteInvitation();
    //             History.replace(Routes.Clients);
    //         },
    //         onReject: () => {
    //             AppController.Instance.PromptModal.closeModal();
    //         },
    //     });
    // }

    private async wrapError(worker: () => Promise<any>) {
        try {
            this._inProgress = true;
            await worker();
        } catch (err) {
            const message = err.message;
            Notifications.push({ message, level: 'error' });
        } finally {
            this._inProgress = false;
        }
    }

    private checkClient(id: string, status: ClientStatus = null) {
        const client = this.getClient(id);
        if (!client) {
            throw new Error('Client was not found');
        }

        if (status != null && client.status !== status) {
            throw new Error(`Client has invalid status '${client.status}', but expected '${status}'`);
        }

        return client;
    }

    private getClient(id: string) {
        return AppController.Instance.User.clients.all.find(c => c.id === id);
    }
}
