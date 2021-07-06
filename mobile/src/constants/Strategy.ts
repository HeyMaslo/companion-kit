import { Identify } from 'common/models';

export type Strategy = {
  title:                    string,
  details:                  string,
  associatedDomainNames:    string[],
};

export type StrategyIded = Identify<Strategy>;

export type DisplayStrategyIded = StrategyIded & {
  isChecked: boolean,
};