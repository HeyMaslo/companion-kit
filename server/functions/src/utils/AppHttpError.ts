import * as functions from 'firebase-functions';

namespace AppHttpError {
    export type InvalidArgDescription = {
        name: string,
        expected?: string;
        got?: string;
        error?: string;
    };

    export function InvalidArguments(...list: InvalidArgDescription[]) {
        const strings = list.map(arg => {
            const details = [
                arg.expected ? `expected: ${arg.expected}` : null,
                arg.got ? `got: ${arg.got}` : null,
                arg.error ? `error: ${arg.error}` : null,
            ].filter(d => d);
            const detailsStr = details.length > 0
                ? ` (${details.join(', ')})`
                : '';
            return `${arg.name}${detailsStr}`;
        });
        const message = `Expected fields: ${strings.join(', ')}`;

        return new functions.https.HttpsError('invalid-argument', message);
    }

    export function AlredyExists(message = 'The items already exists') {
        return new functions.https.HttpsError('already-exists', message);
    }

    export function PreconditionFailed(message = 'Precondition failed') {
        return new functions.https.HttpsError('failed-precondition', message);
    }

    export function Internal(message = 'Internal error') {
        return new functions.https.HttpsError('internal', message);
    }

    export function NoPermission(message = 'Incorrect permissions') {
        return new functions.https.HttpsError('permission-denied', message);
    }
}

export default AppHttpError;
