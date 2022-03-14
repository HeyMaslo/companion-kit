import { observable, computed } from 'mobx';
import AppController from 'src/controllers';
import { ILocalSettingsController } from 'src/controllers/LocalSettings';
import { DailyCheckInScore } from 'src/constants/QoL';
import MoodSliderViewModel from './components/MoodSliderViewModel';


export default class DailyCheckInViewModel {

  readonly sleepChooser = new MoodSliderViewModel();
  readonly moodChooser = new MoodSliderViewModel();

  private readonly _settings: ILocalSettingsController = AppController.Instance.User.localSettings;

  constructor() {
  }

  async init() {
  }

  private checkInResults: DailyCheckInScore = { sleepScore: null, moodScore: null }

  // public set sleepScore(v: number) {
  //   this.checkInResults.sleepScore = v;
  // }

  // public set moodScore(v: number) {
  //   this.checkInResults.moodScore = v;
  // }

  public sendDailyCheckInResults = async () => {
    this.checkInResults.moodScore = Math.round(this.moodChooser.value);
    this.checkInResults.sleepScore = Math.round(this.sleepChooser.value);

    const res: boolean = await AppController.Instance.User.qol.sendDailyCheckIn(this.checkInResults)
    return res;
  }

  public reset() {
    this.checkInResults = { sleepScore: null, moodScore: null }
    this.sleepChooser.reset();
    this.moodChooser.reset();
  }

}
