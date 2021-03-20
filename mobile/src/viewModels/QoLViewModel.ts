// this model will hold the state of the screen
// todo: create data structure to hold responses

/* Notes:
    - will add controller layer after (this will store things I believe - more backend, while model is more state)
*/

import { reaction, transaction, observable, computed, toJS } from 'mobx';
// import { asyncComputed } from 'computed-async-mobx';
// import { ClientJournalEntryIded } from 'common/models/ClientEntries';
// import { StorageReferenceViewModel } from 'common/viewModels/StorageReferenceViewModel';
// import Firebase from 'common/services/firebase';
// import * as Functions from 'common/abstractions/functions';
// import LocationsStrings from 'common/localization/LocationStrings';
// import { safeCall } from 'common/utils/functions';
// import AudioPlayerViewModel from 'src/viewModels/components/AudioPlayerViewModel';
// import AppController from 'src/controllers';
// import EnvConstants from 'src/constants/env';
import { SurveyQuestions, Domains, QUESTIONS_COUNT, DOMAIN_QUESTION_COUNT } from "../constants/QoLSurvey";
import { createLogger } from 'common/logger';

export const logger = createLogger('[QOLModel]');

export default class QOLSurveyViewModel {

    @observable
    private _questionNum: number;

    @observable
    private _domainNum: number;

    private _surveyResponses: any;

    public numQuestions: number = QUESTIONS_COUNT;

    public domainQuestions: number = DOMAIN_QUESTION_COUNT;

    constructor() {
        this._questionNum = 0;
        this._domainNum = 0;
        const surveyResponses = {};

        for (let domain of Domains) {
            surveyResponses[domain] = new Array(DOMAIN_QUESTION_COUNT).fill(0);
        }

        this._surveyResponses = surveyResponses;
    }

    @computed
    get getQuestionNum(): number { return this._questionNum; }

    @computed
    get getDomainNum(): number { return this._domainNum; }

    @computed
    get getQuestion(): string { return SurveyQuestions[this._questionNum]; }

    @computed
    get getDomain(): string { return Domains[this._domainNum]; }

    public nextQuestion(): void {
        if (!((this._questionNum + 1) > (QUESTIONS_COUNT - 1))) {
            this._questionNum++;
            if ((this._questionNum + 1) % (DOMAIN_QUESTION_COUNT) === 1) {
                this._domainNum++;
            }
        }
    }


//     @computed
//     get checkIn(): ClientJournalEntryIded {
//         return this._checkInId == null ? null : AppController.Instance.User.journal.entries.find(e => e.id === this._checkInId);
//     }
//
//     @computed
//     get record(): Readonly<JournalRecordDataIded> {
//         if (this._testRecord) {
//             return this._testRecord;
//         }
//
//         const ref = this.checkIn && AppController.Instance.User.records.observeRecord(this.checkIn.id);
//         const r = ref?.record;
//         if (r?.type === 'journal') {
//             return r;
//         }
//         return null;
//     }
//
//     manualProcess = async () => {
//         if (!EnvConstants.AllowManualProcessing) {
//             return;
//         }
//
//         const record = await Firebase.Instance.getFunction(Functions.AI.ProcessAudioEntry)
//             .execute({
//                 type: 'journal',
//                 clientUid: AppController.Instance.User.user.id,
//                 entryId: this._checkInId,
//                 accountId: AppController.Instance.User.activeAccount.id,
//                 force: true,
//             });
//
//         if (record && record.type === 'journal') {
//             this._testRecord = record;
//         }
//     }
//
//     public clearModel = () => {
//         this._checkInId = null;
//         // this._audioUrl = null;
//     }

//     public dispose = () => {
//         safeCall(this._urlObserver);
//     }
}

