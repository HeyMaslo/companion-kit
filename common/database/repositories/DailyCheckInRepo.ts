import Collections from '../collections';
import { GenericUserRepo } from '.';
import { DailyCheckIn } from '../../../mobile/src/constants/QoL';

export default class DailyCheckInRepo extends GenericUserRepo<DailyCheckIn> {

  get collectionName() {
    return Collections.DailyCheckIns;
  }

  public async addCheckIn(userId: string, score: number) {
    const checkIn: DailyCheckIn = { score: score, date: Date.now() };
    await this.createUserData(userId, checkIn);
  }

}