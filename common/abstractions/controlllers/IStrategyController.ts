import { Strategy } from '../../../mobile/src/constants/Strategy';

export interface IStrategyController {

  getPossibleStrategies(): Promise<Strategy[]>;
  getChosenStrategiesSlugs(): Promise<string[]>;
  
}