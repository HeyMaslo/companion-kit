import {
    IBackendClient,
    IBackendController, RemoteCallResult,
} from '../abstractions/controlllers/IBackendController';

export default abstract class BackendControllerBase implements IBackendController {

    protected abstract get Client(): IBackendClient;
    protected abstract get Authorization(): string;

    public logNewAccount
    (id: string)
    : Promise<RemoteCallResult> {
        console.log(`Using key: ${this.Authorization}`);
        return this.Client.post('/client',
            { id: id },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.Authorization,
                },
            })
            .then((res: any) => {
                return { error: null } as RemoteCallResult;
            })
            .catch((err: any) => {
                console.log(err?.message);
                return {
                    msg: err?.message,
                    error: `Error calling service: ${err}`,
                };
            });
    }

    public logMeasurement
    (clientID: string, source: string, name: string, value: number, date: number)
    : Promise<RemoteCallResult> {
        return this.Client.post('/measurement',
            {
                clientID,
                data: {
                    source,
                    date,
                    name,
                    value,
                },
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.Authorization,
                },
            })
            .then((res: any) => {
                return { error: null } as RemoteCallResult;
            })
            .catch((err: any) => {
                return {
                    msg: err?.message,
                    error: `Error calling service: ${err}`,
                };
            });
    }

}
