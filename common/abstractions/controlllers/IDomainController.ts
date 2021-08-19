import { DomainIded } from '../../../mobile/src/constants/Domain';
import { UserState } from 'common/models/userState';

export interface IDomainController {

  getPossibleDomains(): Promise<DomainIded[]>

}