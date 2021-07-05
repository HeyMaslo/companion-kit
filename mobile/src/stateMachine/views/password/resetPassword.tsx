import { observer } from 'mobx-react';
import { PasswordBase } from './passwordBase';
import { ScenarioTriggers } from 'src/stateMachine/abstractions';
import AppController from 'src/controllers';
import { magicLinkModal } from '../login/magicLink';
import { MagicLinkRequestReasons } from 'common/models/dtos/auth';
import { PushToast } from 'src/stateMachine/toaster';

@observer
export class ResetPasswordView extends PasswordBase {
    protected onGoBack = null;

    protected get title(): string {
        return 'Please create a new password to secure your account';
    }

    protected get useOptions(): boolean {
        return false;
    }

    protected onClose = () => {
        AppController.Instance.Auth.skipPasswordMode();
        this.trigger(ScenarioTriggers.Cancel);
    };

    private async submitRegistration() {
        await this.viewModel.register();
    }

    protected submit = () =>
        this.runLongOperation(async () => {
            if (
                process.appFeatures.MOBILE_STANDALONE &&
                !AppController.Instance.Auth.authUser
            ) {
                const methods = await this.viewModel.getHasAccount();
                // in standalone mode we should never get 'noaccount'
                if (!methods || methods === 'noaccount' || methods.length > 0) {
                    // user is registered already (with google or without a password)
                    this.onClose();
                    return;
                }

                await this.submitRegistration();
                return;
            }

            if (
                !process.appFeatures.USE_MAGIC_LINK &&
                this.viewModel.isResettingPassword
            ) {
                const res = await this.viewModel.resetPassword();

                if (res && res.result) {
                    PushToast({ text: 'Your Password has been set.' });
                    this.trigger(ScenarioTriggers.Secondary);
                }
            }

            const res = await this.viewModel.updatePassword();

            if (res === 'magicLink') {
                this.waitForMagicLink(
                    MagicLinkRequestReasons.PasswordReset,
                    this.submit,
                );
                this.logger.log(
                    'Magic link has been sent for re-authentication',
                );

                await this.showModal(magicLinkModal(this, this.submit));
                return;
            }

            if (res === 'oldPassword') {
                this.onClose();
            }

            if (res === true) {
                PushToast({ text: 'Your Password has been set.' });
            }
        });
}
