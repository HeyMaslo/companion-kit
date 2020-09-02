import logger from 'common/logger';
import  { PlanSwitcher }  from '../viewModels/components/SwitchHandlerViewModel';
import { observable, reaction } from 'mobx';
import Firebase from 'common/services/firebase';
import { Billing as BillingFunctions } from 'common/abstractions/functions';
import CreditCardViewModel from './CreditCard';
import { ClientStatus } from 'common/models/ClientCard';
import { Plans, PlansCategories, getPrevPlanCategory, categoryToClientsCount } from 'common/models';
import AppController from 'app/controllers';
import AppQuery from 'app/services/AppQuery';
import History from 'app/services/history';
import * as Routes from 'app/constants/routes';
import * as ViewModels from 'common/viewModels';
import Env from 'app/constants/env';

type ActivePlans = Plans.annual | Plans.monthly;
const activePlans: ActivePlans[] = [Plans.monthly, Plans.annual];
const categories = [PlansCategories.starter, PlansCategories.pro1, PlansCategories.pro2];

export default class PaymentInfoViewModel {
    @observable
    private _error: string = null;

    @observable
    private _inProgress: boolean = false;

    readonly SwitchHandler = new PlanSwitcher();
    readonly creditCard = new CreditCardViewModel();
    readonly PlanRadioModel = new ViewModels.SelectString<ActivePlans>(activePlans);
    readonly PlanCategoryRadioModel = new ViewModels.SelectString(categories);

    @observable
    selectedCategory: PlansCategories;

    selectedPlanCategory: PlansCategories = null;

    private _unsubscribers = [] as (() => void)[];

    initialize() {
        this._unsubscribers.push(reaction(() => this.billing, () => {
            this.PlanRadioModel.index = activePlans.indexOf(this.defaultPlan);
            this.PlanCategoryRadioModel.index = categories.indexOf(this.currentCategory);
            this.selectedCategory = this.currentCategory;
        }, { fireImmediately: true }));
    }

    get error() { return this._error; }
    get inProgress() { return this._inProgress; }
    get user() { return AppController.Instance.User.user; }
    get billing() { return this.user && this.user.billing; }
    get clients() { return AppController.Instance.User.clients.all
        .filter(c => c.status === ClientStatus.Active || c.status === ClientStatus.Invited);
    }
    set error(err: string) { this._error = err; }
    get downgradeAllowed() {
        const closiestCategory = getPrevPlanCategory(this.currentCategory);

        if (!closiestCategory) {
            return true;
        }

        return categoryToClientsCount[closiestCategory] >= this.clients.length;
    }

    submit = async (cardToken: stripe.Token): Promise<any> => {
        this._error = null;
        logger.warn('All fields are valid!');

        const plan = this.PlanRadioModel.selectedItem;
        const planCategory = this.PlanCategoryRadioModel.selectedItem;

        if (!plan || !planCategory) {
            this._error = 'Select a plan.';
            return;
        }

        AppController.Instance.PromptModal.openModal({
            typeModal: 'positive',
            title: '*Almost there!*',
            message: 'Your request is about to be processed. Are you sure you want to apply the changes?',
            confirmText: 'accept',
            rejectText: 'decline',
            onConfirm: async () => {
                AppController.Instance.PromptModal.closeModal();
                this._inProgress = true;

                try {
                    const result = await Firebase.Instance.getFunction(BillingFunctions.UpdateBilling)
                        .execute({ token: cardToken.id, plan, category: planCategory });

                    PaymentInfoViewModel.trackFBQ();

                    if (!result) {
                        return;
                    }

                    if (result.error || !result.ok) {
                        this._error = result.error;
                        return;
                    }

                    History.push(Routes.Profile);

                    return result;
                } catch (err) {
                    logger.warn('[CreditCardViewModel:saveCardNumber] Something went wrong:', err);
                    this._error = typeof err === 'string' ? err : err.message;
                } finally {
                    this._inProgress = false;
                }
            },
        });
    }

    clearError = () => {
        this._error = null;
    }

    private get defaultPlan() {
        const def = Plans.monthly;

        if (!this.billing || !this.billing.plan) {
            const preselected = AppQuery.Current.period;
            if (preselected === Plans.monthly || preselected === Plans.annual) {
                return preselected;
            }

            return def;
        }

        if (this.billing.plan === Plans.canceled) {
            return def;
        }

        return this.billing.plan;
    }

    private get currentCategory() {
        if (!this.billing) {
            const preselected = AppQuery.Current.plan;
            switch (preselected) {
                case 'starter': {
                    return PlansCategories.starter;
                }

                case 'pro1': {
                    return PlansCategories.pro1;
                }

                case 'pro2': {
                    return PlansCategories.pro2;
                }

                default: {
                    return null;
                }
            }
        }

        return this.billing.planCategory;
    }

    cancelSubscription = async () => {
        this._error = null;

        AppController.Instance.PromptModal.openModal({
            typeModal: 'negative',
            title: 'Do you really want *to cancel your subscription?*',
            message: 'By canceling it, you will no longer have access to your customers data.',
            confirmText: 'Cancel subscription',
            rejectText: 'decline',
            onConfirm: async () => {
                AppController.Instance.PromptModal.closeModal();

                try {
                    this._inProgress = true;
                    await Firebase.Instance.getFunction(BillingFunctions.UpdateBilling)
                        .execute({ token: null, plan: Plans.canceled });

                } catch (err) {
                    logger.warn('[ProfileViewModel:cancelSubscription] Something went wrong:', err);
                } finally {
                    this._inProgress = false;
                }
            },
        });
    }

    private static trackFBQ() {
        if (Env.Current !== 'production') {
            return;
        }

        const fbq = (window as any).fbq as (...args: any[]) => void;
        if (fbq) {
            fbq('track', 'ViewContent', {value: '0.01', currency: 'USD'});
        }
    }

    dispose = () => {
        this._unsubscribers.forEach(u => u());
        this._unsubscribers.length = 0;
    }
}
