import { FunctionFactory } from 'server/utils/createFunction';
import * as functions from 'firebase-functions';
import { Plans } from 'common/models';
import { PlansProd, PlansStag } from 'common/models/PlanIds';
import { Billing as BillingFunctions } from 'common/abstractions/functions';
import Stripe from 'stripe';
import { Repo } from 'server/services/db';
import UserRepo from 'common/database/repositories/UserRepo';
import { BillingInfo } from 'common/models';
import * as StripeService from './services/billing';
import logger from 'common/logger';
import { IS_PROD, STRIPE_WEBHOOK_KEY, FeatureSettings } from 'server/services/config';

export const UpdateBilling = !FeatureSettings.BillingDisabled && new FunctionFactory(BillingFunctions.UpdateBilling)
    .create(async (data, ctx) => {
        const { plan, category } = data;
        logger.log('[UpdateBilling]: recevied params:', plan, category);

        const planIds = IS_PROD ? PlansProd : PlansStag;
        const planId = planIds[plan] && planIds[plan][category];
        let user;

        try {
            user = await Repo.Users.getUserById(ctx.auth.uid);
        } catch (err) {
            logger.log('[UpdateBilling] Error during retriving user');
            logger.log(err.message);
            logger.log(err);
        }

        let updatedBilling: Partial<BillingInfo> = {};
        const now = new Date().getTime() / 1000;

        const customerExist = !!user.billing;
        const attemptToCancel = data.plan === Plans.canceled;
        const resubscribe = customerExist && !user.billing.subscriptionId && !attemptToCancel;
        const cancelationInProgress = customerExist && !!user.billing.cancelAt && now < user.billing.cancelAt;
        const forceCustomerCreating = !customerExist && data.token && !attemptToCancel;
        const cancelation = !cancelationInProgress && attemptToCancel;
        const switchPlan = customerExist && (plan !== user.billing.plan || category !== user.billing.planCategory);
        const discardSubscribtionCancelation = cancelationInProgress && data.token;

        // TODO, remember users credit card
        const updateCard = !!data.token;
        let success = true;

        try {
            /**
             * User doesn't have a stripe customer and received params are valid: creating customer,
             * and subcribe customer to a selected plan
             */
            if (forceCustomerCreating) {
                logger.log('[UpdateBilling] Force customer creation started');
                const customer = await StripeService.createCustomer(user, data.token);
                const subscription = await StripeService.subscribeCustomer(customer.id, planId);

                let card: Stripe.ICard;

                if (typeof customer.default_source === 'string') {
                    card = await StripeService.StripeInstance.customers.retrieveSource(customer.id, customer.default_source) as Stripe.ICard;
                } else {
                    card = customer.default_source as Stripe.ICard;
                }

                updatedBilling = {
                    stripeUid: customer.id,
                    defaultSource: card.id,
                    subscriptionId: subscription.id,
                    planId: subscription.plan.id,
                    trialPeriondEnd: subscription.trial_end,
                    plan: data.plan,
                    planCategory: data.category,
                    last4: card.last4,
                    cancelAt: null,
                };

                logger.log('[UpdateBilling] Force customer creation finished');
                return;
            }

            if (discardSubscribtionCancelation) {
                const subscription = await StripeService.discardCancelation(user.billing.subscriptionId);
                updatedBilling.cancelAt = subscription.cancel_at;
            }

            if (resubscribe) {
                logger.log('[UpdateBilling] Re-subscribe started');

                const subscription = await StripeService.subscribeCustomer(user.billing.stripeUid, planId, true);
                updatedBilling.subscriptionId = subscription.id;
                updatedBilling.plan = plan;
                updatedBilling.planId = subscription.plan?.id;
                updatedBilling.planCategory = category;
                updatedBilling.cancelAt = null;

                logger.log('[UpdateBilling] Re-subscribe finished');
                return;
            }

            if (switchPlan) {
                const subscription = await StripeService.updatePlan(user.billing.subscriptionId, planId);
                updatedBilling.plan = data.plan;
                updatedBilling.planCategory = data.category;
                updatedBilling.planId = subscription.plan.id;
            }

            // A new token was received
            if (updateCard) {
                const card = await StripeService.updateCreditCard(user, data.token);
                updatedBilling.defaultSource = card.id;
                updatedBilling.last4 = card.last4;

                return;
            }

            /** Received plan is cancel: cancel subscription */
            /**
             * When a subscription becomes canceled, the most recent unpaid invoice is closed, and no further invoices are generated.
             * A customer.subscription.deleted event is triggered. (You can see that a subscription was canceled automatically—as opposed
             * to by your request—if the customer.subscription.deleted event’s request property is null.)
             * Since the subscription has been deleted, it cannot be reactivated. Instead, collect updated billing details from your customer,
             * update their default payment method in Stripe, and create a new subscription for their customer record.
             */
            if (cancelation) {
                const subscription = await StripeService.cancelSubscription(user.billing.subscriptionId);
                updatedBilling = { cancelAt: subscription.cancel_at };
                return;
            }
        } catch (err) {
            success = false;
            const message = typeof err === 'string' ? err : (err.message || err.raw && err.raw.message);
            return { ok: false, error: message };
        } finally {
            if (success) {
                logger.log('Updating user\'s billing with fields: ', updatedBilling);
                await Repo.Users.updateBilling(ctx.auth.uid, updatedBilling);
                return { ok: true };
            }
        }

    });

export const StripeWebHook = (STRIPE_WEBHOOK_KEY || null) && functions.https.onRequest(async (req, res) => {
    const { webhookStrings, webhookEvents } = StripeService;
    const stripeSign = req.headers['stripe-signature'];

    try {
        /** Validate stripe signature to be sure this function used only by stripe */
        const event = StripeService.constructEvent(req.rawBody, stripeSign);

        let uid: string;
        let customer: Stripe.customers.ICustomer;

        logger.log('Stripe webhook triggered with event type', event.type);

        switch (event.type) {
            case webhookStrings[webhookEvents.chargeFailed]: {
                const charge = event.data.object as Stripe.charges.ICharge;
                const receivedCustomer = charge.customer;

                const cus = await StripeService.retrieveCustomer(receivedCustomer);
                const invoice = await StripeService.retrieveInvoice(charge.invoice);

                ({ uid } = cus.metadata);

                await Repo.Users.updateBilling(uid, { paymentFailed: true, nextPaymentAttempt: invoice.next_payment_attempt });
                break;
            }

            case webhookStrings[webhookEvents.customerDeleted]: {
                customer = event.data.object as Stripe.customers.ICustomer;
                const metadata = customer && customer.metadata;

                if (!metadata) {
                    logger.log('Cusomer\'s metadata is missing. Unable to find uid and delete billing.');
                    break;
                }

                ({ uid } = customer.metadata);

                // delete biiling for user that was deleted from stripe dashboard
                await Repo.Users.deleteBilling(uid);
                break;
            }

            case webhookStrings[webhookEvents.customerSubscriptionDeleted]: {
                const subsc = event.data.object as Stripe.subscriptions.ISubscription;
                const cus = await StripeService.retrieveCustomer(subsc.customer);

                if (!cus) {
                    logger.log('Unable to retrieve customer:', subsc.customer);
                    break;
                }

                ({ uid } = cus.metadata);

                await Repo.Users.updateBilling(uid, StripeService.getEmptybilling());

                break;
            }

            case webhookStrings[webhookEvents.customerUpdated]: {
                // TODO check for card update
                break;
            }

            case webhookStrings[webhookEvents.chargeSucceeded]: {
                const charge = event.data.object as Stripe.charges.ICharge;
                const receivedCustomer = charge.customer;

                const cus = await StripeService.retrieveCustomer(receivedCustomer);
                const invoice = await StripeService.retrieveInvoice(charge.invoice);

                ({ uid } = cus.metadata);
                const nextPaymentAttempt = invoice && invoice.next_payment_attempt ? invoice.next_payment_attempt : null;

                await Repo.Users.updateBilling(uid, { paymentFailed: false, nextPaymentAttempt });
                break;
            }

            case webhookStrings[webhookEvents.customerSubscriptionUpdated]: {
                const subsc = event.data.object as Stripe.subscriptions.ISubscription;
                const cus = await StripeService.retrieveCustomer(subsc.customer);

                if (!cus) {
                    logger.log('Unable to retrieve customer:', subsc.customer);
                    break;
                }

                ({ uid } = cus.metadata);

                /**
                 * If the first invoice is not paid within 23 hours, the subscription transitions to incomplete_expired.
                 * This is a terminal state, the open invoice will be voided and no further invoices will be generated.
                 */
                if (subsc && subsc.status === 'incomplete_expired') {
                    await Repo.Users.updateBilling(uid, StripeService.getEmptybilling());
                }

                break;
            }

            default:
        }

        res.sendStatus(200);
    } catch (err) {
        logger.log('StripeWebHook error', err.message);
        return res.status(400).end();
    }
});

const Functions: any = {
};

if (UpdateBilling) {
    Functions[UpdateBilling.Definition.Name] = UpdateBilling.AuthFunction;
}

if (StripeWebHook) {
    Functions.webhook = StripeWebHook;
}

export { Functions };
