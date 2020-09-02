
class RepoError extends Error {
    constructor(readonly type: RepoError.Types, message: string) {
        super(message);
    }

    static InvalidArg(argname: string, info: { expected: any, got: any } = null) {
        const infoStr = info ? `Expected '${info.expected}', but got '${info.got}'` : '';
        return new RepoError(RepoError.Types.InvalidArgs, `Invalid '${argname}' argument. ${infoStr}`);
    }

    static AlreadyExists(message: string) {
        return new RepoError(RepoError.Types.AlreadyExists, message);
    }

    static OnlyOne(path: string, query: string) {
        return new RepoError(RepoError.Types.OnlyOne, `Requested query '${query}' for path '${path}' returned not the only item`);
    }
}

namespace RepoError {
    export enum Types {
        Unknown,
        InvalidArgs,
        AlreadyExists,
        OnlyOne,
    }
}

export default RepoError;
