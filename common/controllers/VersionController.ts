
import { IVersionController } from 'common/abstractions/controlllers/IVersionController';
import RepoFactory from 'common/controllers/RepoFactory';

export default class VersionControllerBase implements IVersionController {

  public async getDBVersion(): Promise<VersionStub[]> {
    return await RepoFactory.Instance.version.get();
  }

}

export type VersionStub = {
  id: string;
  date: Date;
  version: string;
};
