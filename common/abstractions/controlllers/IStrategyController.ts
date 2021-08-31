import { StrategyIded } from '../../../mobile/src/constants/Strategy';
import { UserState } from 'common/models/userState';

export interface IStrategyController {

  getPossibleStrategies(): Promise<StrategyIded[]>
  
}