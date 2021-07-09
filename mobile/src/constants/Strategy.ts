import { Identify } from 'common/models';
import { DomainName } from './Domain';

export type Strategy = {
  title:                    string,
  details:                  string,
  associatedDomainNames:    DomainName[],
};

export type StrategyIded = Identify<Strategy>;

export type DisplayStrategyIded = StrategyIded & {
  isChecked: boolean,
};