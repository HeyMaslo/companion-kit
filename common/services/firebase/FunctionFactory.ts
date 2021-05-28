import { FunctionDefinition } from 'common/abstractions/functions.definition';
import firebase from 'firebase';
import { ILogger, createLogger } from 'common/logger';

import type Firebase from 'firebase';

type HttpsError = Firebase.functions.HttpsError;

export class FunctionFactory<TArg, TResult> {

    private readonly logger: ILogger;
    private _errorCatcher: (err: HttpsError) => void = null;

    constructor(readonly Definition: FunctionDefinition<TArg, TResult>, private readonly firebaseFunctions: firebase.functions.Functions) {
        this.logger = createLogger(`[${Definition.Namespace || 'global'}:${Definition.Name}]`);
    }

    catchHttpError(cb: (err: HttpsError) => void) {
        this._errorCatcher = cb;
        return this;
    }

    async execute(arg: TArg): Promise<TResult> {
        const fn = this.firebaseFunctions.httpsCallable(
            this.Definition.FullName,
            {
                timeout: (this.Definition.Timeout || 60) * 1000,
            },
        );
        try {
            const processedArgs = this.Definition.ArgProrcessor(arg);
            this.logger.log('Executing with args:', processedArgs);
            const res = await fn(processedArgs);
            const data = this.Definition.ResultProcessor(res.data);
            this.logger.log('Succeed with result:', data);
            return data;
        } catch (err) {
            this.logger.warn('Failed with error, see details below', err.message);
            console.error(err);

            if (this._errorCatcher && isHttpsError(err)) {
                this._errorCatcher(err);
            }

            throw err;
        }
    }
}

export function isHttpsError(err: any): err is HttpsError {
    const he = err instanceof Error && err as HttpsError;
    return !!he && he.code && he.details;
}
