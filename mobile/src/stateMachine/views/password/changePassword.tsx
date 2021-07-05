import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { PasswordBase } from './passwordBase';
import { ScenarioTriggers } from 'src/stateMachine/abstractions';
import { magicLinkModal } from '../login/magicLink';
import { PushToast } from 'src/stateMachine/toaster';
import AppController from 'src/controllers';
import { Keyboard } from 'react-native';
import { MagicLinkRequestReasons } from 'common/models/dtos/auth';

@observer
export class ChangePasswordView extends PasswordBase {
    @observable
    private _confirmOldPassword = false;

    protected get title(): string {
        return this._confirmOldPassword
            ? 'And your old password to confirm that it’s you'
            : 'Please, create a password to secure your account';
    }

    protected get useOptions() {
        return this._confirmOldPassword ? 'magicLink' : false;
    }

    protected onClose = () => {
        this.trigger(ScenarioTriggers.Back);
    };

    protected onGoBack = () => {
        if (this._confirmOldPassword) {
            this.viewModel.reset();
            this._confirmOldPassword = false;
        } else {
            this.trigger(ScenarioTriggers.Back);
        }
    };

    end() {
        this.viewModel.reset();
    }

    protected useMagicLink = () =>
        this.runLongOperation(async () => {
            Keyboard.dismiss();

            try {
                await AppController.Instance.Auth.signInWithEmailLink(
                    AppController.Instance.Auth.authUser.email,
                    MagicLinkRequestReasons.PasswordChange,
                );

                this.waitForMagicLink(
                    MagicLinkRequestReasons.PasswordChange,
                    this.submit,
                );

                await this.showModal(magicLinkModal(this));
            } catch (err) {
                this.logger.warn('Failed to send magic link');
            }
        });

    protected submit = () =>
        this.runLongOperation(async () => {
            Keyboard.dismiss();

            this.logger.log('SUBMITTING');
            const result = await this.viewModel.updatePassword();

            if (result === 'magicLink') {
                this.waitForMagicLink(
                    MagicLinkRequestReasons.PasswordChange,
                    this.submit,
                );

                await this.showModal(magicLinkModal(this));
                return;
            }

            if (result === 'oldPassword') {
                this._confirmOldPassword = true;
                return;
            }

            if (result) {
                PushToast({ text: 'Your Password has been changed' });
                this.trigger(ScenarioTriggers.Primary);
            }
        });
}
