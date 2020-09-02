import { computed, observable, reaction } from 'mobx';
import AppController from 'app/controllers';
import { ClientModel } from 'app/controllers/ClientModel';
import * as ViewModels from 'common/viewModels';
import { TextInputVM } from 'common/viewModels';
import { AppPromptsCategories, PromptType } from 'common/models/prompts';
import logger from 'common/logger';
import { Unsubscriber, IDisposable } from 'common/utils/unsubscriber';
import AddPromptFormVM from 'app/viewModels/Prompts/AddPromptViewModel';
import { ScheduleFormViewModel } from 'app/viewModels/Prompts/SchedulePromptViewModel';
import SwitchHandlerViewModel from 'app/viewModels/components/SwitchHandlerViewModel';
import Lazy from 'common/utils/lazy';
import { EventTypes } from 'common/models/Events';

const allCategories = 'All categories';

enum ActiveButtons {
    all = 'All',
    activated = 'Activated',
    deactivated = 'Deactivated',
}

export class PromptItemViewModel {
    private readonly _switchModel = new Lazy(() => new SwitchHandlerViewModel().react(() => this.isActive));

    @observable
    private _loading = false;
    private _locked = false;

    constructor(
        public readonly entry: PromptType,
        private readonly _clientGetter: () => ClientModel,
    ) {
    }

    get loading() { return this._loading; }
    get text() { return this.entry.text; }
    get id() { return this.entry.id; }
    // id, name, style
    get category() {
        return AppPromptsCategories.Categories.find(cat => cat.id === this.entry.categoryId) || AppPromptsCategories.Categories[0];
    }

    get isActive() { return this.clientLibrary?.prompts.getIsActive(this.entry.id); }

    get switchModel() { return this._switchModel.value; }

    private get model() { return this._clientGetter(); }
    private get userPrompts() { return AppController.Instance.User.prompts; }
    private get clientLibrary() { return this.userPrompts?.getClientState(this.model.card.clientId); }

    toggleActive = async () => {
        if (this._locked) {
            return;
        }

        this._locked = true;

        try {
            const activeValue = !this.isActive;

            await this.clientLibrary.prompts.setIsActive({ [this.entry.id]: activeValue });
        } catch (e) {
            logger.warn('Error: ', e);
        } finally {
            this._locked = false;
        }
    }

    public removePrompt = () => {
        AppController.Instance.PromptModal.openModal({
            typeModal: 'negative',
            title: 'Are you sure you want *to delete this prompt?*',
            message: 'It will be deleted from your library and the users’ profiles you used it for.',
            confirmText: 'Delete',
            rejectText: 'decline',
            onConfirm: this.remove,
        });
    }

    private remove = async () => {
        // this._loading = true;

        try {
            const events = this.model.events.entries.filter(e => e.type === EventTypes.Prompt && e.promptId === this.id);
            if (events.length > 0) {
                await Promise.all(events.map(e => this.model.events.edit.delete(e.id)));
            }

            await this.userPrompts.crud.delete(this.id);
        } catch (e) {
            logger.warn('Error: ', e);
        } finally {
            // this._loading = false;
        }
    }

    duplicate = async () => {
        this._loading = true;

        try {
            await this.userPrompts.crud.duplicate(this.id);
        } catch (e) {
            logger.warn('Error: ', e);
        } finally {
            this._loading = false;
        }
    }
}

const EmptyLibraryPrompts: PromptType[] = [];

export default class PromptsViewModel implements IDisposable {
    private readonly categoriesSelectList = [null, ...AppPromptsCategories.Types.Helper.Values.filter(val => val !== AppPromptsCategories.Types.Any)];

    private readonly _disposer: Unsubscriber = new Unsubscriber();

    private _activeRadio = new ViewModels.SelectString(Object.values(ActiveButtons));

    readonly search = new TextInputVM({
        name: 'search',
    });

    public readonly addForm = new AddPromptFormVM();
    public readonly scheduleForm = new ScheduleFormViewModel(this.model);
    public readonly switchAll = new SwitchHandlerViewModel().react(() => this.isAllActive);

    @observable
    private _loading = false;
    private _switchAllLocked = false;

    constructor(
        private readonly _clientGetter: () => ClientModel,
    ) {
        this._disposer.add(reaction(() => this.model, model => {
            this._categorySelect.reset();
        }));
    }

    @observable
    private _categorySelect = new ViewModels.Select<AppPromptsCategories.Types>(this.categoriesSelectList, p => {
        if (!p) {
            return allCategories;
        }

        return AppPromptsCategories.Types.Strings[p];
    });

    @computed
    private get fullList() {
        if (!this.model.card?.clientId) {
            return [];
        }

        return this.libraryPrompts.map(e => new PromptItemViewModel(e, this._clientGetter));
    }

    @computed
    get list(): ReadonlyArray<PromptItemViewModel> {
        return this.fullList.filter(e => this.applyFilters(e));
    }

    @computed
    private get isAllActive() {
        return this.list.length > 0 && this.list.every(item => item.isActive);
    }

    get clientName() { return this.model.card.firstName && this.model.card.lastName ? `${this.model.card.firstName} ${this.model.card.lastName}` : null; }

    private get model() { return this._clientGetter(); }
    private get userPrompts() { return AppController.Instance.User.prompts; }
    private get clientLirary() { return this.userPrompts?.getClientState(this.model.card.clientId); }

    private get libraryPrompts() { return this.userPrompts?.library?.types || EmptyLibraryPrompts; }

    get loading() { return this._loading || this.addForm.loading || this.scheduleForm.loading || this.list.some(item => item.loading); }

    get activeRadioGroup() { return this._activeRadio; }
    get selectedActiveRadio() { return this._activeRadio.selectedItem; }
    get categorySelect() { return this._categorySelect; }
    get selectedCategory() { return this.categorySelect?.selectedItem; }

    private applyFilters(entry: PromptItemViewModel) {
        const { text, category, isActive, id } = entry;

        return this.filterByCategory(category.id) && this.filterByActivity(isActive) && this.filterBySearchString(text);
    }

    private filterByCategory(categoryId: AppPromptsCategories.Types) {
        if (this.selectedCategory) {
            return !categoryId || categoryId === this.selectedCategory;
        }

        return true;
    }

    private filterByActivity(active: boolean) {
        if (this.selectedActiveRadio === ActiveButtons.all) {
            return true;
        }

        const activated = this.selectedActiveRadio === ActiveButtons.activated;

        return active === activated;
    }

    private filterBySearchString(text: string) {
        if (!this.search.value) {
            return true;
        }

        return text.toLowerCase().indexOf(this.search.value.toLowerCase()) >= 0;
    }

    fillAddForm(entry: PromptItemViewModel) {
        this.addForm.promptId = entry.id;
        this.addForm.text.value = entry.text;
        this.addForm.category.index = this.addForm.category.values.indexOf(entry.category.name);
    }

    fillScheduleForm(entry: PromptItemViewModel) {
        this.scheduleForm.promptId = entry.id;
        this.scheduleForm.eventText = entry.text;
    }

    activateAll = async () => {
        if (this._switchAllLocked) {
            return;
        }

        try {
            this._switchAllLocked = true;

            // this._loading = true;
            const ids = this.list.map(p => p.id);
            if (this.isAllActive) {
                await this.clientLirary.prompts.deactivate(ids);
            } else {
                await this.clientLirary.prompts.activate(ids);
            }
        } catch (e) {
            logger.warn('Error: ', e);
        } finally {
            // this._loading = false;
            this._switchAllLocked = false;
        }
    }

    dispose() {
        this._disposer.dispose();
    }
}
