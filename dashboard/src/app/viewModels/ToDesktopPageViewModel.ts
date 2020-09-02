import AppController from 'app/controllers';
import { observable } from 'mobx';

export default class ToDesktop {

    @observable
    successfullySent: boolean = false;

    @observable
    showError: boolean = false;

    @observable
    processing: boolean = false;

    signOut = () => {
        return AppController.Instance.Auth.signOut();
    }

    sendLink = async () => {
        this.processing = true;
        try {
            this.successfullySent = await AppController.Instance.User.sendLinktoDesktop();

            if (!this.successfullySent) {
                this.showError = true;
            }
        } catch (err) {
            this.showError = true;
        } finally {
            this.processing = false;
        }
    }

    reset = () => {
        this.showError = false;
        this.successfullySent = false;
        this.processing = false;
    }
}