import { GenericRepo } from 'common/database/repositories';
import { BackendStrategy } from '../../../mobile/src/constants/Strategy';
import Collections from 'common/database/collections';

export default class StrategyRepo extends GenericRepo<BackendStrategy> {

    get collectionName() {
        return Collections.Strategies;
    }

}
