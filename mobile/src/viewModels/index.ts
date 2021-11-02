import CreateCheckInViewModel from './CreateCheckInViewModel';
import Lazy from 'common/utils/lazy';
import SettingsViewModel from './SettingsViewModel';
import { GoalsViewModel } from './GoalsViewModel';
import QOLSurveyViewModel from './QoLViewModel';
import ChooseDomainViewModel from './ChooseDomainViewModel'
import ChooseStrategyViewModel from './ChooseStrategyViewModel'

export interface IAppViewModel {
    CreateCheckIn: CreateCheckInViewModel;
    Settings: SettingsViewModel;
    Goals?: GoalsViewModel;
    QOL: QOLSurveyViewModel;
    ChooseDomain: ChooseDomainViewModel
    ChooseStrategy: ChooseStrategyViewModel;
}

const instance = new Lazy(() => new AppViewModel());

export default class AppViewModel implements IAppViewModel {
    readonly CreateCheckIn = new CreateCheckInViewModel();
    readonly Settings = new SettingsViewModel();
    readonly QOL = new QOLSurveyViewModel();
    readonly ChooseDomain = new ChooseDomainViewModel();
    readonly ChooseStrategy = new ChooseStrategyViewModel();
    readonly Goals = process.appFeatures.GOALS_ENABLED === true ? new GoalsViewModel() : null;
    

    static get Instance(): IAppViewModel { return instance.value; }

    static init() { instance.prewarm(); }
}
