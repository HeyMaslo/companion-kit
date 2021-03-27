import AppController from 'src/controllers';
import CheckInViewModel from './CheckInViewModel';
import { computed } from 'mobx';
import NamesHelper from 'common/utils/nameHelper';
import { months } from 'common/utils/dateHelpers';
import { ITipItem, IStaticTipItem, ICheckInTipItem, IAssessmentTipItem, IDocumentLinkTip } from './components/TipItemViewModel';
import AppViewModel from './index';
import InterventionTipsViewModel from 'src/viewModels/components/InterventionTipsViewModel';
import Localization from 'src/services/localization';
import { createLazy } from 'common/utils/lazy.light';
import { tryOpenLink } from 'src/constants/links';
import { Identify, DocumentLinkEntry, DocumentLinkShareStatuses } from 'common/models';
import { arraySplit } from 'common/utils/mathx';
import { UserProfileViewModel } from './UserProfileViewModel';

const EmptyArr: any[] = [];

export default class HomeViewModel {

    private static readonly _instance = createLazy(() => new HomeViewModel());
    public static get Instance() { return HomeViewModel._instance.value; }

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

    public getArmMagnitudes = async () => {
        return await AppController.Instance.Backend.getDomainMagnitudes();
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
