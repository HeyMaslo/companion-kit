import { reaction, transaction, observable, computed, toJS } from 'mobx';
import AppController from 'src/controllers';
// import { asyncComputed } from 'computed-async-mobx';
// import { ClientJournalEntryIded } from 'common/models/ClientEntries';
// import { StorageReferenceViewModel } from 'common/viewModels/StorageReferenceViewModel';
// import Firebase from 'common/services/firebase';
// import * as Functions from 'common/abstractions/functions';
// import LocationsStrings from 'common/localization/LocationStrings';
// import { safeCall } from 'common/utils/functions';
// import AppController from 'src/controllers';
// import EnvConstants from 'src/constants/env';
import { SurveyQuestions, Domains, QUESTIONS_COUNT, DOMAIN_QUESTION_COUNT, Domain_Importance, DOMAIN_COUNT } from "../constants/QoLSurvey";
import { createLogger } from 'common/logger';

export const logger = createLogger('[QOLModel]');

export default class QOLSurveyViewModel {

    @observable
    private _questionNum: number;

    @observable
    private _domainNum: number;

    @observable
    private _mainDomain: number;
    @observable
    private _leftDomain: number;
    @observable
    private _rightDomain: number;
    

    private _surveyResponses: any;

    public _selectedDomains: any;

    public numQuestions: number = QUESTIONS_COUNT;

    public domainQuestions: number = DOMAIN_QUESTION_COUNT;

    public domainCount: number = DOMAIN_COUNT;


    constructor() {
        this._questionNum = 0;
        this._domainNum = 0;

        this._mainDomain = 1;
        this._rightDomain = 2;
        this._leftDomain = 0;

        const surveyResponses = {};

        const selectedDomains = [];

        for (let domain of Domains) {
            surveyResponses[domain] = new Array(DOMAIN_QUESTION_COUNT).fill(0);
        }

        this._surveyResponses = surveyResponses;
        this._selectedDomains = selectedDomains;
    }

    @computed
    get getQuestionNum(): number { return this._questionNum; }

    @computed
    get getDomainNum(): number { return this._domainNum; }

    @computed
    get getQuestion(): string { return SurveyQuestions[this._questionNum]; }

    @computed
    get getDomain(): string { return Domains[this._domainNum]; }

    get getSurveyResponses(): any { return this._surveyResponses; }

    // get getDomainImportance(): any { return Domain_Importance; }

    // @computed
    get SelectedDomain (): any {return this._selectedDomains};

    public nextQuestion(): void {
        if (!((this._questionNum + 1) > (QUESTIONS_COUNT - 1))) {
            this._questionNum++;
            if ((this._questionNum + 1) % (DOMAIN_QUESTION_COUNT) === 1) {
                this._domainNum++;
            }
        }
    }

    public savePrevResponse(prevResponse: number): void {
        const currDomain: string = this.getDomain;
        const domainResponseIndex: number = this.getQuestionNum % DOMAIN_QUESTION_COUNT;
        const domainResponseArray: number[] = this._surveyResponses[currDomain];
        domainResponseArray[domainResponseIndex] = prevResponse;
    }


    public getDomainDisplay () : string[] {
        // if (this._leftDomain == -1) {
        //     return ['',Domains[0], Domains[1]];
        // }

        // if (this._rightDomain == DOMAIN_COUNT) {
        //     return [Domains[DOMAIN_COUNT - 3], Domains[DOMAIN_COUNT - 2], ''];
        // }

        return [Domains[this._leftDomain % DOMAIN_COUNT], Domains[this._mainDomain % DOMAIN_COUNT], Domains[this._rightDomain % DOMAIN_COUNT],Domain_Importance[this._mainDomain]];
    }

    public getNextDomain (dir:number) : void {
        if (dir > 0){
            if (!((this._rightDomain + 1) > (DOMAIN_COUNT))) {
                this._rightDomain++;
                this._mainDomain++;
                this._leftDomain++;
            }
        }

        if (dir < 0){
            if (!((this._leftDomain - 1) < -1)) {
                this._rightDomain--;
                this._mainDomain--;
                this._leftDomain--;
            }

        }
    }

    public selectDomain(domain: string): void {
        this._selectedDomains.push(domain);
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

