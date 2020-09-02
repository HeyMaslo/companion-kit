import * as functions from 'firebase-functions';

export type BaseResponse = {
    ok: boolean;
    message: string;
};

export type BaseRequest = {

};

export class EndpointFunction<TRequest extends BaseRequest = BaseRequest, TResponse extends BaseResponse = BaseResponse> {

    private _code: number = 404;
    private _data: Partial<TResponse> = <Partial<TResponse>>{ ok: false, message: 'Unprocessed' };

    constructor(
        private readonly _request: functions.https.Request,
        private readonly _responsne: functions.Response,
    ) {

    }

    get body(): TRequest { return this._request.body as TRequest; }

    error(code: number = 500) {
        this._code = code;
        return this;
    }

    ok(code: number = 200) {
        this._code = code;
        return this;
    }

    data(data: Partial<TResponse>) {
        this._data = data;
        return this;
    }

    dispose() {
        this._responsne.status(this._code);
        this._responsne.send(this._data);
    }
}

export type EndpointHandler<TRequest extends BaseRequest, TResponse extends BaseResponse>
    = (context: EndpointFunction<TRequest, TResponse>) => Promise<any> | any;

export function createFunction<TRequest extends BaseRequest = BaseRequest, TResponse extends BaseResponse = BaseResponse>(
    handler: EndpointHandler<TRequest, TResponse>,
) {
    return functions.https.onRequest(async (request, response) => {
        const f = new EndpointFunction<TRequest, TResponse>(request, response);
        try {
            await handler(f);
        } finally {
            f.dispose();
        }
    });
}