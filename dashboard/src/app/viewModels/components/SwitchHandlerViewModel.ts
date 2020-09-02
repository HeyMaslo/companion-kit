import { observable, computed } from 'mobx';
import AppController from 'app/controllers';
import { Plans } from 'common/models';
import { TransitionObserver } from 'common/utils/transitionObserver';

export default class SwitchHandlerViewModel {
    @observable
    private _isSwitched: boolean = null;

    private _observer: TransitionObserver<boolean>;

    constructor(initialState: boolean = null) {
        this._isSwitched = initialState;
    }

    get isSwitched() { return this._isSwitched; }

    set isSwitched(val: boolean) {
        this._isSwitched = val;
    }

    public toggle() {
        this._isSwitched = !this._isSwitched;
    }

    react(getter: () => boolean) {
        if (this._observer) {
            this._observer.dispose();
            this._observer = null;
        }

        if (getter) {
            this._observer = new TransitionObserver(getter)
                .cb(v => this.isSwitched = v)
                .andForceCheck();
        }

        return this;
    }
}

export class PlanSwitcher extends SwitchHandlerViewModel {
    @computed
    get defaultSwitched() {
        const user = AppController.Instance.User.user;
        const billing = user && user.billing;

        return !billing ? null : billing.plan === Plans.annual;
    }

    get isSwitched() { return super.isSwitched != null ? super.isSwitched : this.defaultSwitched; }

    set isSwitched(val: boolean) {
        super.isSwitched = val;
    }
}
