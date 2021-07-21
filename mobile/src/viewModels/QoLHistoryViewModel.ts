import { observable, computed, toJS } from 'mobx';
import { PersonaDomains } from '../stateMachine/persona';
import { createLogger } from 'common/logger';
import AppController from 'src/controllers';
import { ILocalSettingsController } from 'src/controllers/LocalSettings';
import { PartialQol, QolSurveyResults, QolSurveyType } from 'src/constants/QoL';
import { PersonaArmState } from 'dependencies/persona/lib';
import { SurveyResults } from 'common/database/repositories/SurveyResultsRepo';

export const logger = createLogger('[QOLModel]');

export default class QoLHistoryViewModel {

    public initModel: Promise<void>;

    private _historyEntries: SurveyResults[];
    public selectedEntry: SurveyResults;

    public get historyEntries(): SurveyResults[] {
      return this._historyEntries;
    }

    constructor() {
        this.initModel = AppController.Instance.User.qol.getAllSurveyResults().then((surveyResults: SurveyResults[]) => {
          this._historyEntries = surveyResults;
          this._historyEntries.sort((a, b) => a.date - b.date)
          return;
        });
    }

    async init() {
        return await this.initModel;
    }
    
}
