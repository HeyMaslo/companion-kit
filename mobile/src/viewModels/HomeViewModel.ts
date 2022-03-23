import AppController from 'src/controllers';
import CheckInViewModel from './CheckInViewModel';
import { computed } from 'mobx';
import NamesHelper from 'common/utils/nameHelper';
import { equalDateByDay, months } from 'common/utils/dateHelpers';
import { ITipItem, IStaticTipItem, ICheckInTipItem, IFinishQolTipItem, IFullQolTipItem, IShortQolTipItem, IAssessmentTipItem, IDocumentLinkTip } from './components/TipItemViewModel';
import AppViewModel from './index';
import InterventionTipsViewModel from 'src/viewModels/components/InterventionTipsViewModel';
import Localization from 'src/services/localization';
import { createLazy } from 'common/utils/lazy.light';
import { tryOpenLink } from 'src/constants/links';
import { Identify, DocumentLinkEntry, DocumentLinkShareStatuses } from 'common/models';
import { arraySplit } from 'common/utils/mathx';
import { UserProfileViewModel } from './UserProfileViewModel';
import { QolSurveyResults } from 'src/constants/QoL';
import { PersonaArmState } from 'dependencies/persona/lib';
import { ILocalSettingsController } from 'src/controllers/LocalSettings';
import ResourceViewModel, { ResourceType } from './ResourceViewModel';

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

    @computed
    get resources(): ReadonlyArray<ResourceViewModel> {
        // MK-TODO: - get real resources from firebase like checkIns function above
        return [
            new ResourceViewModel('testID1', '5 Ways to Boost Morning Energy', ResourceType.ARTICLE, '#0F6EB4', true),
            new ResourceViewModel('testID2', 'A Guide to Mindful Meditation', ResourceType.VIDEO, '#E58933', false),
            new ResourceViewModel('testID3', 'Navigating Stress & Anxiety', ResourceType.APP, '#BC1B5F', true),
            new ResourceViewModel('testID4', 'Improving Sleep Quality', ResourceType.WEBINAR, '#5495A4', true),
        ];
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
                    title: "It's time for your daily check-in",
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
                title: "It's time for your daily check-in",
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
        const nextFullQol = new Date(lastFullQol.getDate() + 28);
        const today: Date = new Date();

        if (equalDateByDay(nextFullQol, today)) {
            this._settings.updateQolSettings({ lastFullQol: Date() }, 'lastFullQol');
            this._settings.updateQolSettings({ pendingFullQol: true }, 'pendingFullQol');
            return true;
        } else return AppController.Instance.User.localSettings?.current?.qol?.pendingFullQol;
    }

    // returns true if it has been 7 calendar days since last Short QoL
    // return true if there is a pending Short QoL
    private isTimeForShortQol(): boolean {
        const lastShortQol: Date = new Date(AppController.Instance.User.localSettings?.current?.qol?.lastShortQol);
        const nextShortQol = new Date(lastShortQol.getDate() + 7);
        const today: Date = new Date();

        if (equalDateByDay(nextShortQol, today)) {
            this._settings.updateQolSettings({ lastShortQol: Date() }, 'lastShortQol');
            this._settings.updateQolSettings({ pendingShortQol: true }, 'pendingShortQol');
            return true;
        } else return AppController.Instance.User.localSettings?.current?.qol?.pendingShortQol;
    }

    private hasCompletedDailyCheckInToday(): boolean {
        const lastDailyCheckIn: Date = new Date(AppController.Instance.User.localSettings?.current?.lastDailyCheckIn);
        const today: Date = new Date();

        return lastDailyCheckIn.getDay() === today.getDay()
            && lastDailyCheckIn.getMonth() === today.getMonth()
            && lastDailyCheckIn.getFullYear() === today.getFullYear()
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
