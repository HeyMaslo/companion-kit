import Collections from '../collections';
import { GenericUserRepo } from '.';
import { DailyCheckIn, DailyCheckInScore } from '../../../mobile/src/constants/QoL';

export default class DailyCheckInRepo extends GenericUserRepo<DailyCheckIn> {

  get collectionName() {
    return Collections.DailyCheckIns;
  }

  public async addCheckIn(userId: string, score: DailyCheckInScore) {
    const checkIn: DailyCheckIn = { sleepScore: score.sleepScore, moodScore: score.moodScore, date: Date.now() };
    await this.createUserData(userId, checkIn);
  }

}