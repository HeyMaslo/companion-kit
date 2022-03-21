import { GenericRepo } from 'common/database/repositories';
import Collections from 'common/database/collections';
import { Strategy } from '../../../mobile/src/constants/Strategy';

export default class StrategyRepo extends GenericRepo<Strategy> {

    get collectionName() {
        return Collections.Strategies;
    }

}
