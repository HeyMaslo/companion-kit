import { VersionStub } from 'common/controllers/VersionController';
import AppController from 'src/controllers';

const LOCAL_DB_VERSION = '1.0';

export default class VersionViewModel {

  private _DBVersion: string;

  public get DBVersion() {
    return this._DBVersion;
  }

  public get isInvalidVersion() {
    return this._DBVersion != LOCAL_DB_VERSION;
  }

  async init() {
    await AppController.Instance.User.version.getDBVersion().then((versionStrs: VersionStub[]) => {
      if (versionStrs.length > 0) {
        this._DBVersion = versionStrs[0].version;
      }
      return;
    });
  }

}
