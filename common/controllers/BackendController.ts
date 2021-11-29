import { ScheduledAffirmationNotification } from '../models/userState';
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

    public logNotification
    (clientID: string, scheduled: ScheduledAffirmationNotification): Promise<RemoteCallResult>  {
        return this.Client.post('/affirmation/notif', {
            id: scheduled.notifId,
            data: {
                affirmationId: scheduled.affirmation.id,
                userId: clientID,
                date: scheduled.scheduledDate,
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

    public logAffirmation(affirmationId: string, content: string, domains: string[], keywords: string[]): Promise<RemoteCallResult> {
        return this.Client.post('/affirmations/:affirmationId', {
            id: affirmationId,
            data: {
                domains,
                keywords,
                content,
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
