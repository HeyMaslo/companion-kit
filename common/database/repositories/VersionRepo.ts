
import Collections from '../collections';
import { GenericRepo } from '.';
import { VersionStub } from 'controllers/VersionController';

export default class VersionRepo extends GenericRepo<VersionStub> {

  get collectionName() {
    return Collections.Version;
  }

}