import { Domain, FocusedDomains } from '../../../mobile/src/constants/Domain';

export interface IDomainController {

  getPossibleDomains(): Promise<Domain[]>;

  getFocusedDomains(): Promise<FocusedDomains>;

  setUser(userId: string): void;

}