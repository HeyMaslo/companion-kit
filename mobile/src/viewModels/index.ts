import CreateCheckInViewModel from './CreateCheckInViewModel';
import Lazy from 'common/utils/lazy';
import SettingsViewModel from './SettingsViewModel';
import { GoalsViewModel } from './GoalsViewModel';

export interface IAppViewModel {
    CreateCheckIn: CreateCheckInViewModel;
    Settings: SettingsViewModel;
    Goals?: GoalsViewModel;
}

const instance = new Lazy(() => new AppViewModel());

export default class AppViewModel implements IAppViewModel {
    readonly CreateCheckIn = new CreateCheckInViewModel();
    readonly Settings = new SettingsViewModel();
    readonly Goals = process.appFeatures.GOALS_ENABLED === true ? new GoalsViewModel() : null;

    static get Instance(): IAppViewModel { return instance.value; }

    static init() { instance.prewarm(); }
}
