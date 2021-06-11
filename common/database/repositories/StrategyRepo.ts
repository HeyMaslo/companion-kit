import { GenericRepo } from 'common/database/repositories';
import { Strategy } from '../../../mobile/src/constants/QoL';
import Collections from 'common/database/collections';

export default class StrategyRepo extends GenericRepo<Strategy> {

    get collectionName() {
        return Collections.Strategies;
    }

}
