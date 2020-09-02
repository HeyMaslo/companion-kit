import { observable, transaction } from 'mobx';
import { ThrottleProcessor } from 'common/utils/throttle';
import logger from 'common/logger';

export interface IActivityController {
    getIsActive(id: string): boolean;
    setIsActive(map: Record<string, boolean>): Promise<void>;

    activate(ids: string[]): Promise<void>;
    deactivate(ids: string[]): Promise<void>;
}

type ItemType<TKey extends string> = { active: boolean } & {
    [P in TKey] : string
};

type Diff = Record<string, { active: boolean }>;
type DiffItem = { id: string, active: boolean };

export class ActivityController<T extends ItemType<TKey>, TKey extends string> implements IActivityController {

    @observable
    private _activeById: Record<string, boolean> = {};

    private readonly _submitter: ThrottleProcessor<DiffItem>;

    constructor(
        readonly key: TKey,
        readonly submit: (diff: Diff) => Promise<any>,
    ) {
        this._submitter = new ThrottleProcessor(this._doSubmit);
    }

    public setItems(items: T[]) {
        this._activeById = { };
        items?.forEach(a => {
            this._activeById[a[this.key]] = a.active;
        });
    }

    getIsActive(id: string): boolean {
        return this._activeById[id];
    }

    async setIsActive(map: Record<string, boolean>): Promise<void> {
        transaction(() => {
            Object.keys(map).forEach(id => {
                this._activeById[id] = map[id];
                this._submitter.push({ id, active: map[id] });
            });
        });
    }

    private _doSubmit = async (diffs: DiffItem[]) => {
        const resultDiff: Diff = { };
        diffs.forEach(di => {
            resultDiff[di.id] = { active: di.active };
        });

        try {
            await this.submit(resultDiff);
        } catch (err) {
            transaction(() => {
                diffs.forEach(di => {
                    this._activeById[di.id] = !di.active;
                });
            });
            logger.error(err);
        }
    }

    activate(ids: string[]) {
        if (!ids?.length) {
            return;
        }

        const diff: Record<string, boolean> = { };
        ids.forEach(id => diff[id] = true);

        return this.setIsActive(diff);
    }

    deactivate(ids: string[]) {
        if (!ids?.length) {
            return;
        }

        const diff: Record<string, boolean> = { };
        ids.forEach(id => diff[id] = false);

        return this.setIsActive(diff);
    }

}