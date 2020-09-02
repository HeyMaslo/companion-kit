import { transaction } from 'mobx';
import Lazy from 'common/utils/lazy';
import { IStorageController, StorageController } from 'common/controllers/StorageController';
import PromptModalViewModel from 'common/viewModels/PromptModalViewModel';
import Env from 'app/constants/env';
import { IAuthController, AuthController } from './Auth';
import { IUserController, UserController } from './User';

export interface IAppController {
    readonly Auth: IAuthController;
    readonly User: IUserController;
    readonly Storage: IStorageController;
    readonly PromptModal: PromptModalViewModel;
    readonly FullVersion: string;
}

class AppControllerImpl implements IAppController {

    readonly auth = new AuthController();
    readonly user = new Lazy(() => new UserController(this.auth));
    readonly promptModal = new Lazy(() => new PromptModalViewModel());

    constructor() {
        this.auth.onSignOut.on(this.dispose);
    }

    get Auth(): IAuthController { return this.auth; }
    get User(): IUserController { return this.user.value; }
    get Storage(): IStorageController { return StorageController.Instance; }
    get PromptModal(): PromptModalViewModel { return this.promptModal.value; }

    get FullVersion(): string {
        return `${Env.App.Version}${fc(Env.Current)}${process.developVersion || ''} ${Env.App.Hash}`;
    }

    dispose = () => {
        transaction(() => {
            this.user.value.dispose();
            this.user.reset();
            this.user.prewarm();
        });
    }
}

function fc(str: string, skipEmpty = false) {
    if (!str) {
        return skipEmpty
            ? ''
            : '?';
    }
    return str[0];
}

const instance = new Lazy(() => new AppControllerImpl());

const AppController = {
    get Instance(): IAppController { return instance.value; },
};

export default AppController;
