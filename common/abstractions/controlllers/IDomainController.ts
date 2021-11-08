import { DomainIded, DomainName } from '../../../mobile/src/constants/Domain';
import { UserState } from 'common/models/userState';

export interface IDomainController {

  getPossibleDomains(): Promise<DomainIded[]>;

  getFocusedDomains(): Promise<DomainName[]>;

  setUser(userId: string): void;

}