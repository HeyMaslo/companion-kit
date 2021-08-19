import AppController from 'src/controllers';
import CheckInViewModel from './CheckInViewModel';
import { computed } from 'mobx';
import NamesHelper from 'common/utils/nameHelper';
import { months } from 'common/utils/dateHelpers';
import { ITipItem, IStaticTipItem, ICheckInTipItem, IFinishQolTipItem, IFullQolTipItem, IShortQolTipItem, IAssessmentTipItem, IDocumentLinkTip } from './components/TipItemViewModel';
import AppViewModel from './index';
import InterventionTipsViewModel from 'src/viewModels/components/InterventionTipsViewModel';
import Localization from 'src/services/localization';
import { createLazy } from 'common/utils/lazy.light';
import { tryOpenLink } from 'src/constants/links';
import { Identify, DocumentLinkEntry, DocumentLinkShareStatuses } from 'common/models';
import { arraySplit } from 'common/utils/mathx';
import { UserProfileViewModel } from './UserProfileViewModel';
import { QolSurveyResults, QolSurveyType } from 'src/constants/QoL';
import { PersonaDomains } from 'src/stateMachine/persona';
import { PersonaArmState } from 'dependencies/persona/lib';
import { ILocalSettingsController } from 'src/controllers/LocalSettings';

const EmptyArr: any[] = [];

export default class HomeViewModel {

    private static readonly _instance = createLazy(() => new HomeViewModel());
    public static get Instance() { return HomeViewModel._instance.value; }
    private readonly _settings: ILocalSettingsController = AppController.Instance.User.localSettings;

    public readonly interventionTips = process.appFeatures.INTERVENTIONS_ENABLED ? new InterventionTipsViewModel() : null;

    get loading() { return AppController.Instance.User.journal.loading; }

    @computed
    get today() {
        const date = new Date();

        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    get name() {
        return this.firstName;
    }

    @computed
    get coachProfile() {
        return new UserProfileViewModel(AppController.Instance.User.activeAccount?.coachId);
    }

    get coachName() {
        return AppController.Instance.User.activeAccount?.coachName || 'Your therapist';
    }

    @computed
    get firstName() { return NamesHelper.ensureFromUsers(AppController.Instance.User.user, AppController.Instance.Auth.authUser).firstName; }

    @computed
    get checkIns(): ReadonlyArray<CheckInViewModel> {
        return AppController.Instance.User.journal.entries
            .map(s => new CheckInViewModel().setCheckInId(s.id));
    }

    get showAssessment() { return process.appFeatures.ASSESSMENTS_ENABLED && !!AppController.Instance.User.assessments?.nextFormTypeAvailable; }

    get newDocumentLink() {
        return AppController.Instance.User.documents.popupDocument;
    }

    @computed
    private get generalTips(): ITipItem[] {
        let result: ITipItem[] = [];

        if (process.appFeatures.INTERVENTIONS_ENABLED && this.interventionTips?.tips?.length) {
            result.push(
                ...this.interventionTips.tips.map(tip => ({
                    id: tip.id,
                    type: 'interventionTip' as 'interventionTip',
                    title: tip.title,
                    status: tip.status,
                    actions: tip.actions,
                })),
            );
        }

        if (this.showAssessment) {
            result.push(<IAssessmentTipItem>{
                id: 'assessment',
                type: 'assessment',
                title: Localization.Current.MobileProject.assessmentTipText || 'New Assessment',
            });
        }

        if (result.length > 0) {
            return result;
        }

        if (process.appFeatures?.MOBILE_STATIC_TIPS_ENABLED) {
            return AppController.Instance.User.staticTips?.map(st => (<IStaticTipItem>{
                type: 'staticTip',
                id: st.id,
                title: st.title,
                url: st.url,
                staticTipType: st.type,
            })) || EmptyArr;
        }

        this.submitPendingShortIfTimeForFull()
        const needsDailyCheckIn = !this.hasCompletedDailyCheckInToday();
        result = [];

        if (needsDailyCheckIn) {
            result = [
                <ICheckInTipItem>{
                    id: 'check-in',
                    type: 'check-in',
                    title: AppViewModel.Instance.CreateCheckIn.question || 'Create a new check-in!',
                }];
        }

        if (AppViewModel.Instance.QOL.isUnfinished) {
            result.unshift(
                <IFinishQolTipItem>{
                    id: 'finish-qol',
                    type: 'finish-qol',
                    title: 'Tap to continue your QoL Survey!',
                });
            return result;
        }

        if (this.isTimeForFullQol()) {
            result.unshift(
                <IFullQolTipItem>{
                    id: 'full-qol',
                    type: 'full-qol',
                    title: "It's time for your monthly check-in!",
                });
        }

        if (this.isTimeForShortQol()) {
            result.unshift(
                <IShortQolTipItem>{
                    id: 'short-qol',
                    type: 'short-qol',
                    title: "It's time for your weekly check-in!",
                });
        }

        return result.length == 0 ?
            [<ICheckInTipItem>{
                id: 'check-in',
                type: 'check-in',
                title: AppViewModel.Instance.CreateCheckIn.question || 'Create a new check-in!',
            }] 
            : result;
    }

    @computed
    get tips(): ReadonlyArray<ITipItem> {
        return this.addDocLinkTips(this.generalTips);
    }

    private addDocLinkTips(tips: ITipItem[]) {
        const [newLinks, openedLinks] = arraySplit(
            AppController.Instance.User.documents.activeLinks,
            d => !d.share || d.share.status === DocumentLinkShareStatuses.Sent,
        );

        const docLinkToTip = (d: Identify<DocumentLinkEntry>) => (<IDocumentLinkTip>{
            type: 'docLinkTip',
            id: d.id,
            title: `${this.coachName} sent you ${d.name}`,
            url: d.link,
            open: () => this.openDocumentLink(d),
        });

        return [
            ...newLinks.map(docLinkToTip),
            ...tips,
            ...openedLinks.map(docLinkToTip),
        ];
    }

    private submitPendingShortIfTimeForFull() {
        if (AppController.Instance.User.localSettings?.current?.qol?.pendingShortQol && this.isTimeForFullQol()) {
            this._settings.updateQolSettings({ pendingShortQol: false }, 'pendingShortQol');
        }
    }

    // returns true if it has been 28 calendar days since last Full QoL
    // return true if there is a pending Full QoL
    private isTimeForFullQol(): boolean {
        const lastFullQol: Date = new Date(AppController.Instance.User.localSettings?.current?.qol?.lastFullQol);
        let nextFullQol: Date = lastFullQol;
        nextFullQol.setDate(nextFullQol.getDate() + 28);
        const today: Date = new Date();

        if (nextFullQol.getDay() === today.getDay() && nextFullQol.getMonth() === today.getMonth()
        && nextFullQol.getFullYear() === today.getFullYear()) {
            this._settings.updateQolSettings({ lastFullQol: Date() }, 'lastFullQol');
            this._settings.updateQolSettings({ pendingFullQol: true }, 'pendingFullQol');
            return true;
        } else if (AppController.Instance.User.localSettings?.current?.qol?.pendingFullQol) {
            return true; 
        }
        return false;
    }

        // returns true if it has been 7 calendar days since last Short QoL
        // return true if there is a pending Short QoL
        private isTimeForShortQol(): boolean {
            const lastShortQol: Date = new Date(AppController.Instance.User.localSettings?.current?.qol?.lastShortQol);
            let nextShortQol: Date = lastShortQol;
            nextShortQol.setDate(nextShortQol.getDate() + 7);
            const today: Date = new Date();

            if (nextShortQol.getDay() === today.getDay() && nextShortQol.getMonth() === today.getMonth()
            && nextShortQol.getFullYear() === today.getFullYear()) {
                this._settings.updateQolSettings({ lastShortQol: Date() }, 'lastShortQol');
                this._settings.updateQolSettings({ pendingShortQol: true }, 'pendingShortQol');
                return true;
            } else if (AppController.Instance.User.localSettings?.current?.qol?.pendingShortQol) { 
                return true; 
            }
            return false;
        }

    private hasCompletedDailyCheckInToday(): boolean {
        const lastDailyCheckIn: Date = new Date(AppController.Instance.User.localSettings?.current?.lastDailyCheckIn);
        const today: Date = new Date();

        return (lastDailyCheckIn.getDay() === today.getDay() && lastDailyCheckIn.getMonth() === today.getMonth() && lastDailyCheckIn.getFullYear() === today.getFullYear())
    }

    public getArmMagnitudes = async () => {
        const lastSurveyScores: QolSurveyResults = await AppController.Instance.User.backend.getSurveyResults();
        if (lastSurveyScores === null) {
            return PersonaArmState.createEmptyArmState();
        }
        let currentArmMagnitudes: PersonaArmState = {};
        for (let domain of PersonaDomains) {
            let score: number = lastSurveyScores[domain];
            let mag: number = 0.4 + (score * 3 / 100);
            currentArmMagnitudes[domain] = mag;
        }
        return currentArmMagnitudes;
    }

    public markLinkDocumentAsSeen = (doc: Identify<DocumentLinkEntry>) => {
        const docid = this.newDocumentLink?.id;
        if (!docid) {
            return;
        }

        return AppController.Instance.User.documents.markAsSeen(docid);
    }

    public openDocumentLink = async (doc: Identify<DocumentLinkEntry>) => {
        const docid = doc?.id;
        const url = doc?.link;
        if (!docid || !url) {
            return;
        }

        const res = await tryOpenLink(url);
        if (res) {
            await AppController.Instance.User.documents.markAsOpened(docid);
        }
    }
}
