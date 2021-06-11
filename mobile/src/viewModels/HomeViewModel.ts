import AppController from 'src/controllers';
import CheckInViewModel from './CheckInViewModel';
import { computed } from 'mobx';
import NamesHelper from 'common/utils/nameHelper';
import { months } from 'common/utils/dateHelpers';
import { ITipItem, IStaticTipItem, ICheckInTipItem, IFinishQolTipItem, IMonthlyQolTipItem, IAssessmentTipItem, IDocumentLinkTip } from './components/TipItemViewModel';
import AppViewModel from './index';
import InterventionTipsViewModel from 'src/viewModels/components/InterventionTipsViewModel';
import Localization from 'src/services/localization';
import { createLazy } from 'common/utils/lazy.light';
import { tryOpenLink } from 'src/constants/links';
import { Identify, DocumentLinkEntry, DocumentLinkShareStatuses } from 'common/models';
import { arraySplit } from 'common/utils/mathx';
import { UserProfileViewModel } from './UserProfileViewModel';
import { QolSurveyResults } from 'src/constants/QoL';
import { PersonaDomains } from 'src/stateMachine/persona';
import { PersonaArmState } from 'dependencies/persona/lib';
import { ILocalSettingsController } from 'src/controllers/LocalSettings';
import logger from 'common/logger';

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
        const result: ITipItem[] = [];

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

        if (AppViewModel.Instance.QOL.isUnfinished) {
            return [
                <IFinishQolTipItem>{
                    id: 'finish-qol',
                    type: 'finish-qol',
                    title: 'Tap to continue your QoL Survey!',
                },
                // Currently always shows 'daily' check-in as this feature has not yet been implemented
                <ICheckInTipItem>{
                    id: 'check-in',
                    type: 'check-in',
                    title: AppViewModel.Instance.CreateCheckIn.question || 'Create a new check-in!',
                },
            ];
        }

        if (this.isTimeForMonthlyQol()) {
            return [
                <IMonthlyQolTipItem>{
                    id: 'monthly-qol',
                    type: 'monthly-qol',
                    title: "It's time for your monthly check-in!",
                },
                // Currently always shows 'daily' check-in as this feature has not yet been implemented
                <ICheckInTipItem>{
                    id: 'check-in',
                    type: 'check-in',
                    title: AppViewModel.Instance.CreateCheckIn.question || 'Create a new check-in!',
                },
            ];
        }

        return [
            <ICheckInTipItem>{
                id: 'check-in',
                type: 'check-in',
                title: AppViewModel.Instance.CreateCheckIn.question || 'Create a new check-in!',
            },
        ];
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

    // returns true if it has been 28 calendar days since last Monthly QoL
    private isTimeForMonthlyQol(): boolean {
        const lastMonthlyQol: Date = new Date(AppController.Instance.User.localSettings?.current?.qol?.lastMonthlyQol);
        let nextMonthlyQol: Date = lastMonthlyQol;
        nextMonthlyQol.setDate(nextMonthlyQol.getDate() + 28);
        const today: Date = new Date();
        if (nextMonthlyQol.getDay() === today.getDay() && nextMonthlyQol.getMonth() === today.getMonth()
        && nextMonthlyQol.getFullYear() === today.getFullYear()) {
            this._settings.updateLastMonthlyQol({ lastMonthlyQol: Date() });
            this._settings.updatePendingMonthlyQol({ pendingMonthlyQol: true });
            return true;
        } else if (AppController.Instance.User.localSettings?.current?.qol?.pendingMonthlyQol) { return true; }
        return false;
    }

    public getArmMagnitudes = async () => {
        const lastSurveyScores: QolSurveyResults = await AppController.Instance.User.backend.getSurveyResults();
        if (lastSurveyScores === null) {
            return PersonaArmState.createEmptyArmState();
        }
        let currMags: PersonaArmState = {};
        for (let domain of PersonaDomains) {
            let score: number = lastSurveyScores[domain];
            let mag: number = 0.4 + (score * 3 / 100);
            currMags[domain] = mag;
        }
        return currMags;
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
