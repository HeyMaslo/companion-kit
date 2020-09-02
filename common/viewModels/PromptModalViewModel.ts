import { observable } from 'mobx';

export type PromptModalAction = {
        title: string;
        message: string | JSX.Element;
        confirmText: string;
        rejectText?: string;
        onConfirm: () => Promise<any> | void;
        onReject?: () => Promise<void> | void;
        modalImage?: number;
        awaitActions?: boolean;
        className?: string;
        typeModal: 'negative' | 'positive';
};

export default class PromptModalViewModel {
    @observable
    private _isActive: boolean = false;

    @observable.ref
    private _currentAction: PromptModalAction;

    get isActive() {
        return this._isActive;
    }

    set isActive(val: boolean) {
        this._isActive = val;
    }

    get currentAction() { return this._currentAction; }

    openModal(action: PromptModalAction) {
        this._currentAction = action;
        this._isActive = true;
    }

    public closeModal() {
        this._isActive = false;
    }

    onConfirm = async () => {
        if (this.currentAction.onConfirm) {
            const promise = this.currentAction.onConfirm();
            if (this.currentAction.awaitActions) {
                await promise;
            }
        }

        this.closeModal();
    }

    onReject = async () => {
        if (this.currentAction.onReject) {
            const promise = this.currentAction.onReject();
            if (this.currentAction.awaitActions) {
                await promise;
            }
        }

        this.closeModal();
    }
}
