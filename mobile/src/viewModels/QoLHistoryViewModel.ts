import { createLogger } from 'common/logger';
import AppController from 'src/controllers';
import { SurveyResults } from 'common/database/repositories/SurveyResultsRepo';

export const logger = createLogger('[QOLModel]');

export default class QoLHistoryViewModel {

  private initModel: Promise<void>;

  private _historyEntries: SurveyResults[];
  private _selectedEntry: SurveyResults;
  private _selctedEntryWeekNumebr: number = 1;

  public get historyEntries(): SurveyResults[] {
    return this._historyEntries;
  }

  public get selectedEntry() {
    return this._selectedEntry;
  }

  public setSelectedEntry(entry: SurveyResults, weekNum: number) {
    this._selectedEntry = entry;
    this._selctedEntryWeekNumebr = weekNum;
  }

  public get selectedEntryWeekNumber() {
    return this._selctedEntryWeekNumebr;
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
