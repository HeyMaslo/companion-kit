import Lazy from 'common/utils/lazy';
import SettingsViewModel from './SettingsViewModel';
import { GoalsViewModel } from './GoalsViewModel';
import QOLSurveyViewModel from './QoLViewModel';
import DomainViewModel from './DomainViewModel'
import StrategyViewModel from './StrategyViewModel'
import QoLHistoryViewModel from './QoLHistoryViewModel';
import VersionViewModel from './VersionViewModel';
import DailyCheckInViewModel from './DailyCheckInViewModel';
import ResourceViewModel from './ResourceViewModel';

export interface IAppViewModel {
    Version: VersionViewModel;
    Settings: SettingsViewModel;
    Goals?: GoalsViewModel;
    DailyCheckIn: DailyCheckInViewModel;
    QOL: QOLSurveyViewModel;
    QoLHistory: QoLHistoryViewModel;
    Domain: DomainViewModel
    Strategy: StrategyViewModel;
    Resource: ResourceViewModel;
}

const instance = new Lazy(() => new AppViewModel());

export default class AppViewModel implements IAppViewModel {
    readonly Version = new VersionViewModel();
    readonly Settings = new SettingsViewModel();
    readonly DailyCheckIn = new DailyCheckInViewModel();
    readonly QOL = new QOLSurveyViewModel();
    readonly QoLHistory = new QoLHistoryViewModel();
    readonly Domain = new DomainViewModel();
    readonly Strategy = new StrategyViewModel();
    readonly Resource = new ResourceViewModel();
    readonly Goals = process.appFeatures.GOALS_ENABLED === true ? new GoalsViewModel() : null;


    static get Instance(): IAppViewModel { return instance.value; }

    static init() { instance.prewarm(); }
}
