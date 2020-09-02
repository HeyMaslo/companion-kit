import { toJS } from 'mobx';
import { BaseUpdateDto } from 'common/models/dtos/updateDto';

export interface IItemsCRUDController<T> {
    add(...items: T[]): Promise<void>;
    duplicate(id: string): Promise<void>;
    delete(id: string): Promise<void>;
    update(item: T): Promise<void>;
}

export class ItemsCRUDController<T extends { id: string }> implements IItemsCRUDController<T> {

    constructor(
        readonly types: () => T[],
        readonly submit: (dto: BaseUpdateDto<T>) => Promise<any>,
        readonly updateExisting: (from: T, to: T) => void,
    ) {

    }

    public add(...items: T[]) {
        return this.submit({
            add: items,
        });

        // await Firebase.Instance.getFunction(CoachesFunctions.PromptsEndpoint)
        //     .execute({ add: prompts, type: 'prompt' });
    }

    async duplicate(id: string) {
        const p = this.types()?.find(lp => lp.id === id);
        if (!p) {
            throw new Error('Item to duplicate was not found');
        }

        return this.submit({
            add: [toJS({...p, id: null })],
        });
        // await Firebase.Instance.getFunction(CoachesFunctions.PromptsEndpoint)
        //     .execute({add: [toJS(p)], type: 'prompt'});
    }

    async delete(id: string) {
        const types = this.types();
        const existingIndex = types?.findIndex(pp => pp.id === id);
        if (!types || existingIndex < 0) {
            throw new Error('Item to delete was not found, id = ' + id);
        }

        const [backup] = types.splice(existingIndex, 1);

        try {
            return this.submit({
                remove: [id],
            });
            // await Firebase.Instance.getFunction(CoachesFunctions.PromptsEndpoint)
            //     .execute({remove: [id], type: 'prompt'});
        } catch (err) {
            this.types().splice(existingIndex, 0, backup);

            throw err;
        }
    }

    async update(prompt: T) {
        const e = prompt && this.types()?.find(pp => pp.id === prompt.id);
        if (!e) {
            throw new Error('Prompt was not found, id = ' + prompt?.id);
        }

        const backup = {...e};

        this.updateExisting(prompt, e);

        try {
            return this.submit({
                update: [prompt],
            });
            // await Firebase.Instance.getFunction(CoachesFunctions.PromptsEndpoint)
            //     .execute({update: [prompt], type: 'prompt'});
        } catch (err) {
            this.updateExisting(backup, e);

            throw err;
        }
    }

}
