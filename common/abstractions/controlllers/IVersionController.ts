import { VersionStub } from 'controllers/VersionController';

export interface IVersionController {

  getDBVersion(): Promise<VersionStub[]>;

}