import { createLazy } from 'common/utils/lazy.light';
import Firebase from 'common/services/firebase';

import {
    DBProvider,
    UserRepo,
    CoachRepo,
    ClientRepo,
    ClientCardRepo,
    RecordRepo,
    StaticTipsRepo,
    SurveyResultsRepo,
    DomainRepo,
    StrategyRepo,
    UserStateRepo,
    AffirmationRepo,
} from 'common/database/repositories';

const PROXIES_PREFIX = 'proxies';

interface IRepoConstructor<T> {
    new (provider: DBProvider): T;
}

type RepoType<T> = {
    [P in keyof T]: ((...args: any[]) => Promise<any>) | any;
};

const instance = createLazy(() => new RepoFactory(false));

export default class RepoFactory {

    static get Instance() { return instance.value; }

    private readonly _users = createLazy(() => new UserRepo(Firebase.Instance.database));
    private readonly _coaches = createLazy(() => new CoachRepo(Firebase.Instance.database));
    private readonly _clients = createLazy(() => new ClientRepo(Firebase.Instance.database));
    private readonly _clientCards = createLazy(() => new ClientCardRepo(Firebase.Instance.database));
    private readonly _records = createLazy(() => new RecordRepo(Firebase.Instance.database));
    private readonly _staticTips = createLazy(() => new StaticTipsRepo(Firebase.Instance.database));
    private readonly _qolSurveyResults = createLazy(() => new SurveyResultsRepo(Firebase.Instance.database));
    private readonly _qolDomains = createLazy(() => new DomainRepo(Firebase.Instance.database));
    private readonly _strategies = createLazy(() => new StrategyRepo(Firebase.Instance.database));
    private readonly _userState = createLazy(() => new UserStateRepo(Firebase.Instance.database));
    private readonly _affirmations = createLazy(() => new AffirmationRepo(Firebase.Instance.database));

    constructor(
        private readonly useProxy: boolean,
    ) {
    }

    get users(): UserRepo { return this._users.value; }
    get coaches(): CoachRepo { return this._coaches.value; }
    get clients(): ClientRepo { return this._clients.value; }
    get clientCards(): ClientCardRepo { return this._clientCards.value; }
    get records(): RecordRepo { return this._records.value; }
    get staticTips(): StaticTipsRepo { return this._staticTips.value; }
    get surveyResults(): SurveyResultsRepo { return this._qolSurveyResults.value; }
    get qolDomains(): DomainRepo { return this._qolDomains.value };
    get strategies(): StrategyRepo { return this._strategies.value };
    get userState(): UserStateRepo { return this._userState.value };
    get affirmations(): AffirmationRepo { return this._affirmations.value };

    // private createProxyRepo<T extends RepoType<T>>(prefix: string, Type: IRepoConstructor<T>) {
    //     const repo = new Type(Firebase.Instance.database);

    //     if (!this.useProxy) {
    //         return repo;
    //     }

    //     const res = { } as T;
    //     const proto = Object.getPrototypeOf(repo);
    //     Object.getOwnPropertyNames(proto).forEach(k => {
    //     // Object.keys(obj).forEach(k => {
    //         const kk = k as keyof T;
    //         const descr = Object.getOwnPropertyDescriptor(proto, k);
    //         // ignore getters
    //         if (descr.get) {
    //             return;
    //         }

    //         const func = repo[kk];
    //         if (typeof func !== 'function' || k === 'constructor') {
    //             // console.log('Ignoring key', k, 'in type', typeof proto);
    //             return;
    //         }

    //         const funcName = `${PROXIES_PREFIX}-${prefix}-${k}`;

    //         res[kk] = (async (...args: any[]) => {

    //             const fn = Firebase.Instance.functions.httpsCallable(funcName);
    //             const result = await fn({ args: [...args.filter(a => typeof a !== 'function')]});

    //             return result.data;
    //         }) as T[typeof kk];
    //     });

    //     return res;
    // }
}
