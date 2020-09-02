import { observable, transaction, computed } from 'mobx';
import logger from 'common/logger';
import AppController from 'app/controllers';
import History from 'app/services/history';
import * as Routes from 'app/constants/routes';
import { SessionItem } from './ClientEntryItem';
import * as ViewModels from 'common/viewModels';

import Firebase from 'common/services/firebase';
import { AI as AIFunctions } from 'common/abstractions/functions';

export default class SessionInnerViewModel {
    @observable
    private _sessionId: string;

    @observable
    private _clientId: string;

    @observable
    private _inProgress = false;

    private _filter = new ViewModels.SelectString(['Other', 'Person', 'Art']);

    setSessionEntry = (clientId: string, sessionId: string) => {
        transaction(() => {
            this._clientId = clientId;
            this._sessionId = sessionId;
        });
    }

    get filter() { return this._filter; }

    @computed
    private get client() { return AppController.Instance.User.clients.getModel(this._clientId); }

    @computed
    private get session() { return this.client && this.client.sessions?.entries.find(s => s.id === this._sessionId); }

    @computed
    get sessionItem() { return this.session && new SessionItem(this.session, () => this.client); }

    get entryExists() { return this._sessionId ? this.client?.sessions?.getIsEntryExists(this._sessionId) : null; }
    get inProgress() { return this._inProgress || this.client.loading || (this.sessionItem && this.sessionItem.loading); }

    get firstName() { return (this.client && this.client.card) ? this.client.card.firstName : 'Stranger'; }

    public deleteSession = () => {
        AppController.Instance.PromptModal.openModal({
            typeModal: 'negative',
            title: 'Are you sure you want *to delete this session?*',
            message: 'The entry and all processed data will be deleted permanently.',
            confirmText: 'Delete',
            rejectText: 'decline',
            onConfirm: this.doDeleteSession,
        });
    }

    private doDeleteSession = async () => {
        try {
            this._inProgress = true;

            const result = await this.client.sessions?.delete(this.session.id);
            if (!result.ok) {
                logger.error('Failed to delete session:', result.error);
                return;
            }

            if (!result.recordOk) {
                logger.warn('Session has been deleted, but there was a problem with deleting record:', result.error);
            }

            History.replace(Routes.ClientDetails(this._clientId, Routes.ClientDetails.Tabs.sessions));
        } catch (err) {
            logger.error('Unexpected error during session entry deletion:', err);
        } finally {
            this._inProgress = false;
        }
    }

    manualProcess = async () => {
        try {
            this._inProgress = true;

            const result = await Firebase.Instance.getFunction(AIFunctions.ProcessAudioEntry)
                .execute({
                    type: 'session',
                    accountId: this.client.card.id,
                    entryId: this.session.id,
                    clientUid: this.client.card.clientId,
                });

            if (result.type === 'session') {
                const vm = this.sessionItem;
                if (vm) {
                    vm.overrideRecord(result);
                }
            }

            logger.log('Session entry processed:', result);
        } catch (err) {
            logger.error('Failed to process session entry:', err);
        } finally {
            this._inProgress = false;
        }
    }
}
