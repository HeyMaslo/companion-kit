import { observable, transaction, computed } from 'mobx';
import AppController from 'app/controllers';
import { JournalItem } from './ClientEntryItem';

import Firebase from 'common/services/firebase';
import { AI as AIFunctions } from 'common/abstractions/functions';
import { createLogger } from 'common/logger';

const logger = createLogger('[JournalInnerViewModel]');

export default class JournalInnerViewModel {
    @observable
    private _journalId: string;

    @observable
    private _clientId: string;

    @observable
    private _inProgress = false;

    setJournalEntry = (clientId: string, journalId: string) => {
        transaction(() => {
            this._clientId = clientId;
            this._journalId = journalId;
        });
    }

    get inProgress() { return this._inProgress || this.client.loading || this.journalItem?.loading; }

    get entryExists() { return this._journalId ? this.client?.journal.getIsEntryExists(this._journalId) : null; }

    @computed
    private get journal() { return this.client && this.client.journal.entries.find(j => j.id === this._journalId); }

    @computed
    get journalItem(): JournalItem { return this.journal && new JournalItem(this.journal, () => this.client); }

    @computed
    get client() { return AppController.Instance.User.clients.getModel(this._clientId); }

    manualProcess = async () => {
        try {
            this._inProgress = true;

            const result = await Firebase.Instance.getFunction(AIFunctions.ProcessAudioEntry)
                .execute({
                    type: 'journal',
                    accountId: this.client.card.id,
                    entryId: this._journalId,
                    clientUid: this.client.card.clientId,
                });

            if (result.type === 'journal') {
                const vm = this.journalItem;
                if (vm) {
                    vm.overrideRecord(result);
                }
            }

            logger.log('Journal entry processed:', result);
        } catch (err) {
            logger.error('Failed to process journal entry:', err);
        } finally {
            this._inProgress = false;
        }
    }
}
