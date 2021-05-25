import { observable, computed, autorun, reaction } from 'mobx';
import { createLogger } from 'common/logger';
import appleHealthKit from 'rn-apple-healthkit';
const logger = createLogger('[SettingsHealthAuthViewModel]');

export class SettingsHealthAuthViewModel {

    @observable
    private _isEnabled: boolean = this.originalIsEnabled;

    private get originalIsEnabled() { return !!appleHealthKit.Constants.Permissions; }
    
    get isEnabled() { return this._isEnabled}
    get isActivityEnabled() { return this._isEnabled; }
    get isMindfulnessEnabled() { return this._isEnabled; }
    get isNutritionEnabled() { return this._isEnabled; }
    get isMobilityEnabled() { return this._isEnabled; }
    get isMoEnabled() { return this._isEnabled; }
    get isRespiratoryEnabled() { return this._isEnabled; }
    get isSleepEnabled() { return this._isEnabled; }
    
    updateEnabledState = () => {
        this._isEnabled = this.originalIsEnabled;
    } 
}
