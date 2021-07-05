import { computed } from 'mobx';
import AppController from 'src/controllers';
import { ClientStatus } from 'common/models';
import Localization from 'src/services/localization';

export class NoProfileViewModel {
    private get userAccounts() {
        return AppController.Instance.User?.accounts;
    }
    private get authUser() {
        return AppController.Instance.Auth.authUser;
    }

    get email() {
        return this.authUser?.email || '';
    }
    get name() {
        return this.authUser?.displayName || '';
    }

    @computed
    get allAccounts() {
        return (this.userAccounts || []).map((s) => ({
            text: `${Localization.Current.MobileProject.dashboardEssence}: ${s.coachName} (${s.status})`,
            id: s.id,
        }));
    }

    get hasDisabledAccount() {
        return (
            this.userAccounts &&
            this.userAccounts.some((a) => a.status === ClientStatus.Inactive)
        );
    }

    logout = async () => {
        await AppController.Instance.Auth.signOut();
    };
}
