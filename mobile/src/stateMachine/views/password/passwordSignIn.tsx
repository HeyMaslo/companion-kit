import { observer } from 'mobx-react';
import { PasswordBase } from './passwordBase';
import { ScenarioTriggers, PersonaStates } from 'src/stateMachine/abstractions';

@observer
export class PasswordSignInView extends PasswordBase {
    protected onClose = null;

    protected get title(): string {
        return 'Enter your password to confirm that it’s you';
    }

    protected get useOptions(): boolean {
        return true;
    }

    protected onGoBack = () => {
        this.viewModel.resetPasswordInput();
        this.trigger(ScenarioTriggers.Back);
    };

    protected submit = () =>
        this.runLongOperation(() => this.viewModel.signInWithPassword());
}
