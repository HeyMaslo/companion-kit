export type RemoteCallResult = {
    error?: string,
    message?: any,
};

export interface IBackendClient {
    post (path: string, data: any, opts: any): any;
}

export interface IBackendController {

    logNewAccount(id: string)
    : Promise<RemoteCallResult>;

    logMeasurement
    (clientID: string, coachID: string, type: string, value: number, date: number)
    : Promise<RemoteCallResult>;

}
