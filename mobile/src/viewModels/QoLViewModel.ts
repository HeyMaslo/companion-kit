// this model will hold the state of the screen
// todo: create functionality for "next" when an option is pressed that will update the view
// todo: create data structure to hold responses

/* Notes:
    - may need to add mobx @ tags in the view so that it will re-render when the state is changed
    - will add controller layer after (this will store things I believe - more backend, while model is more state)
*/

import { reaction, transaction, observable, computed, toJS } from 'mobx';
// import { asyncComputed } from 'computed-async-mobx';
// import { ClientJournalEntryIded } from 'common/models/ClientEntries';
// import { StorageReferenceViewModel } from 'common/viewModels/StorageReferenceViewModel';
// import Firebase from 'common/services/firebase';
// import * as Functions from 'common/abstractions/functions';
// import LocationsStrings from 'common/localization/LocationStrings';
// import { getTimeSafe, months } from 'common/utils/dateHelpers';
// import { safeCall } from 'common/utils/functions';
// import { SpeechRecognition, JournalRecordDataIded, Moods, TipsLabels, WordReference } from 'common/models';
// import logger from 'common/logger';
// import AudioPlayerViewModel from 'src/viewModels/components/AudioPlayerViewModel';
// import AppController from 'src/controllers';
// import EnvConstants from 'src/constants/env';
// import { google } from '@google-cloud/vision/build/protos/protos';
// import vision = google.cloud.vision;
// import { VisionRecognition } from 'common/models/VisionRecognition';
import { SurveyQuestions, QUESTIONS_COUNT } from "../constants/QoLSurvey";
import { createLogger } from 'common/logger';

export const logger = createLogger('[QOLModel]');

export default class QOLSurveyViewModel {

    @observable
    private _questionNum: number;

    public numQuestions: number = QUESTIONS_COUNT;

    constructor() {
        this._questionNum = 0;
    }

    @computed
    get getQuestionNum(): number { return this._questionNum; }

    @computed
    get getQuestion(): string { return SurveyQuestions[this._questionNum]; }

    public nextQuestion(): void {
        if (!((this._questionNum + 1) > (QUESTIONS_COUNT - 1))) {
            this._questionNum++;
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

