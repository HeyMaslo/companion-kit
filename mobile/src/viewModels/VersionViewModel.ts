import { VersionStub } from '../../../common/controllers/VersionController';
import AppController from 'src/controllers';

const SUPPORTED_DB_VERSION = '1.0.3';

export default class VersionViewModel {

  private _DBVersion: string;

  public get DBVersion() {
    return this._DBVersion;
  }

  public get isInvalidVersion() {
    return this._DBVersion != SUPPORTED_DB_VERSION;
  }

  async init() {
    await AppController.Instance.User.version.getDBVersion().then((versionStubs: VersionStub[]) => {
      // The version collection in firestore should only contain 1 object, we recieve an array (VersionStub[]) here but it's length should only ever be 1
      if (versionStubs.length > 0) {
        this._DBVersion = versionStubs[0].version;
      }
      return;
    });
  }

}
