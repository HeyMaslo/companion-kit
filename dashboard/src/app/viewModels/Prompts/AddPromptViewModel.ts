import { observable } from 'mobx';
import { Select, TextInputVM, ValidatableViewModel } from 'common/viewModels';
import * as Validations from 'common/utils/validation';
import Localization from 'app/services/localization';
import logger from 'common/logger';
import { AppPromptsCategories } from 'common/models/prompts';
import AppController from 'app/controllers';

export default class AddPromptFormVM {
    @observable
    private _promptId: string = null;

    @observable
    private _error: string = null;

    @observable
    private _loading: boolean = false;

    get promptId() { return this._promptId; }

    set promptId(val: string) {
        this._promptId = val;
    }

    get error() { return this._error; }

    get loading() { return this._loading; }

    text = new TextInputVM({
        name: 'promptText',
        trimOnValidate: false,
        validation: {
            validator: val => Validations.Validators.textLength(val, 100),
            errors: Localization.ValidationErrors,
            accessor: error => error.replace('{length}', '100'),
        },
    });

    category = new Select<AppPromptsCategories.Types>(
        AppPromptsCategories.Types.Helper.Values,
        (p: AppPromptsCategories.Types) => AppPromptsCategories.Types.Strings[p],
    );

    private addPrompt = async (): Promise<{ok: boolean}> => {
        this._error = null;

        if (await ValidatableViewModel.IsSomeInvalid([this.text])) {
            return;
        }

        this._loading = true;

        try {
            await AppController.Instance.User.prompts.crud.add({
                id: null,
                categoryId: this.category.selectedItem,
                text: this.text.value,
            });

            return {ok: true};
        } catch (err) {
            logger.warn('[ERROR]: ', err);
            this._error = err.message;

            return {ok: false};
        } finally {
            this._loading = false;
        }
    }

    private editPrompt = async (): Promise<{ok: boolean}> => {
        this._error = null;

        try {
            if (await ValidatableViewModel.IsSomeInvalid([this.text])) {
                return;
            }

            this._loading = true;

            await AppController.Instance.User.prompts.crud.update( {
                id: this.promptId,
                categoryId: this.category.selectedItem,
                text: this.text.value,
            });

            return {ok: true};
        } catch (err) {
            this._error = err.message;
            logger.error('Failed to edit prompt:', err);

            return {ok: false};
        } finally {
            this._loading = false;
        }
    }

    public submit = async () => {
        if (this.promptId) {
            const resp = await this.editPrompt();
            return resp.ok;
        }

        const res = await this.addPrompt();
        return res.ok;
    }

    public reset = () => {
        this.text.reset();
        this.category.reset();
        this.promptId = null;
    }
}
