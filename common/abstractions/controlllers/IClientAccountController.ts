import { IDisposable } from 'common/utils/unsubscriber';

export interface IClientAccountController extends IDisposable {
    setAccount(coachId: string, clientId: string, clientCardId: string, loggerName?: string): void;
}

export namespace IClientAccountController {
    export interface Ctor<T extends IClientAccountController> {
        new(): T;
    }
}
