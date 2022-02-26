import CreateCheckInViewModel from './CreateCheckInViewModel';
import Lazy from 'common/utils/lazy';
import SettingsViewModel from './SettingsViewModel';
import { GoalsViewModel } from './GoalsViewModel';
import QOLSurveyViewModel from './QoLViewModel';
import DomainViewModel from './DomainViewModel'
import StrategyViewModel from './StrategyViewModel'
import QoLHistoryViewModel from './QoLHistoryViewModel';
import VersionViewModel from './VersionViewModel';

export interface IAppViewModel {
    Version: VersionViewModel;
    CreateCheckIn: CreateCheckInViewModel;
    Settings: SettingsViewModel;
    Goals?: GoalsViewModel;
    QOL: QOLSurveyViewModel;
    QoLHistory: QoLHistoryViewModel;
    Domain: DomainViewModel
    Strategy: StrategyViewModel;
}

const instance = new Lazy(() => new AppViewModel());

export default class AppViewModel implements IAppViewModel {
    readonly Version = new VersionViewModel();
    readonly CreateCheckIn = new CreateCheckInViewModel();
    readonly Settings = new SettingsViewModel();
    readonly QOL = new QOLSurveyViewModel();
    readonly QoLHistory = new QoLHistoryViewModel();
    readonly Domain = new DomainViewModel();
    readonly Strategy = new StrategyViewModel();
    readonly Goals = process.appFeatures.GOALS_ENABLED === true ? new GoalsViewModel() : null;
    

    static get Instance(): IAppViewModel { return instance.value; }

    static init() { instance.prewarm(); }
}
