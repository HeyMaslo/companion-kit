import { observable, computed, autorun, reaction } from 'mobx';
import AppController from 'src/controllers';
import { createLogger } from 'common/logger';
import AppleHealthKit from 'rn-apple-healthkit';
const logger = createLogger('[SettingsHealthAuthViewModel]');

export class SettingsHealthAuthViewModel {

    @observable
    private _isEnabled: boolean = this.originalIsEnabled;

    private get originalIsEnabled() { return !!AppController.Instance.User?.localSettings; }  // get user auth in other app

    get isEnabled() { return this._isEnabled; }
    get isActivityEnabled() { return this._isEnabled; }
    get isMindfulnessEnabled() { return this._isEnabled; }
    get isNutritionEnabled() { return this._isEnabled; }
    get isMoEnabled() { return this._isEnabled; }
    get isRespiratoryEnabled() { return this._isEnabled; }
    get isSleepEnabled() { return this._isEnabled; }
    
    updateEnabledState = () => {
        this._isEnabled = this.originalIsEnabled;
    }

    AppleHealthKit

    init() {
        this.updateEnabledState();
        logger.log('init this.originalIsEnabled =', this.originalIsEnabled, 'this.isEnabled =', this.isEnabled);
        this._unsubscribe = reaction(() => this.originalIsEnabled, enabled => {
            logger.log('originalIsEnabled CHANGED:', enabled, ', this.isEnabled =', this.isEnabled);
            this.updateEnabledState();
        });
    }


    // to be fixed to without authr
    private _unsubscribe: () => void = null;
    dispose() { 
        if (this._unsubscribe) {
            this._unsubscribe();
        }
    }
    
}
