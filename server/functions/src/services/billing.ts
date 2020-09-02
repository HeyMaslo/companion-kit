import { Identify, UserProfile } from 'common/models';
import logger from 'common/logger';
import Stripe from 'stripe';
import AppHttpError from 'server/utils/AppHttpError';
import { STRIPE_WEBHOOK_KEY, STRIPE_API_KEY } from 'server/services/config';

export const StripeInstance = new Stripe(STRIPE_API_KEY);

export enum webhookEvents {
    customerUpdated,
    customerDeleted,
    chargeFailed,
    customerSubscriptionDeleted,
    chargeSucceeded,
    customerSubscriptionUpdated,
}

export const webhookStrings = {
    [webhookEvents.chargeFailed]: 'charge.failed',
    [webhookEvents.customerUpdated]: 'customer.updated',
    [webhookEvents.customerDeleted]: 'customer.deleted',
    [webhookEvents.customerSubscriptionDeleted]: 'customer.subscription.deleted',
    [webhookEvents.chargeSucceeded]: 'charge.succeeded',
    [webhookEvents.customerSubscriptionUpdated]: 'customer.subscription.updated',
};

export async function subscribeCustomer(customerId: string, planId: string, skipTrial?: boolean): Promise<Stripe.subscriptions.ISubscription> {
    try {
        const customer = await StripeInstance.customers.retrieve(customerId);
        const currentSubscription = await getCustomerActiveSubscription(customer);

        if (currentSubscription) {
            logger.log(`Customer with id ${customerId} alerady subscribed.`);
            return currentSubscription;
        }

        /** retrieve plan to know trial_period_days */
        const plan = await StripeInstance.plans.retrieve(planId);
        const settings: Stripe.subscriptions.ISubscriptionCreationOptions = {
            customer: customerId,
            items: [{ plan: plan.id }],
        };

        if (!skipTrial) {
            settings.trial_period_days = plan.trial_period_days || 0;
        }

        const subscription = await StripeInstance.subscriptions.create(settings);

        return subscription;
    } catch (err) {
        logger.log('[subscribeCustomer] Error', err, err.message);
        throw AppHttpError.Internal(`Error during subscribing to a plan. ${err.message}`);
    }
}

export async function createCustomer(user: Identify<UserProfile>, tokenId: string): Promise<Stripe.customers.ICustomer> {
    try {
        const customers = await StripeInstance.customers.list();
        const customer = customers.data.find(c => {
            const emailAlreadyExist = c.email === user.email;
            const uidAlreadyExist = !!(c.metadata && c.metadata.uid === user.id);

            return uidAlreadyExist || emailAlreadyExist;
        });

        if (customer) {
            logger.log(`[CreateCustomer]: User with stripe uid ${customer.id} and email ${customer.email} already exist. Updating existing user with new source.`);

            return StripeInstance.customers.update(customer.id, {
                // setting source here will delete existing default source and set this one as default
                source: tokenId,
                metadata: { uid: user.id },
                description: 'Customer created on Maslo Pro dashboard',
            });
        }

        return StripeInstance.customers.create({
            source: tokenId,
            email: user.email,
            description: 'Customer created on Maslo Pro dashboard',
            metadata: { uid: user.id },
        });
    } catch (err) {
        logger.log('createCustomer catch', err.message);
        throw AppHttpError.Internal(`Error during creation a billing account. ${err.message}`);
    }
}

export async function cancelSubscription(subscriptionId: string): Promise<Stripe.subscriptions.ISubscription> {
    try {
        const subscription = await StripeInstance.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
        return subscription;
    } catch (err) {
        throw AppHttpError.Internal('Error during subscription cancelation. Unable to update subscription.');
    }
}

export async function updateCreditCard(user: Identify<UserProfile>, cardToken: string): Promise<Stripe.cards.ICard> {
    const { billing } = user;
    let newSource: Stripe.IStripeSource;

    if (!billing) {
        logger.log('[Billing:UpdateCreditCard] Unable to update credit card for user without billing');
        throw AppHttpError.Internal('Unable to update credit card for user without billing.');
    }

    try {
        newSource = await StripeInstance.customers.createSource(billing.stripeUid, {
            source: cardToken,
        }) as Stripe.cards.ICard;

        await StripeInstance.customers.update(billing.stripeUid, { default_source: newSource.id });

    } catch (err) {
        throw AppHttpError.Internal(`Error during saving new credit card. ${err.message}`);
    }

    /** delete previous credit card */
    if (billing.defaultSource) {
        try {
            await StripeInstance.customers.deleteSource(billing.stripeUid, billing.defaultSource);
        } catch (err) {
            throw AppHttpError.Internal('Unable to delete existing credit card, but a new one was successfully added and set as default.');
        }
    }

    return newSource;
}

export async function discardCancelation(subscriptionId: string): Promise<Stripe.subscriptions.ISubscription> {
    try {
        /** if subscription is not canceled yet, update it */
        const updatedSubscription = await StripeInstance.subscriptions.update(subscriptionId, { cancel_at_period_end: false });
        return updatedSubscription;
    } catch (err) {
        throw AppHttpError.Internal(`Error during update subscription. ${err.message}`);
    }
}

export async function updatePlan(subscriptionId: string, newPlanId: string): Promise<Stripe.subscriptions.ISubscription> {
    const subscription = await StripeInstance.subscriptions.retrieve(subscriptionId);
    const item = subscription.items.data[0];

    try {
        const s = await StripeInstance.subscriptions.update(subscription.id, {
            items: [{ id: item.id, plan: newPlanId }],
        });

        return s;
    } catch (err) {
        throw AppHttpError.Internal(`Error during update subscription. ${err.message}`);
    }
}

export const constructEvent = (body: any, sign: string | string[]) => StripeInstance.webhooks.constructEvent(body, sign, STRIPE_WEBHOOK_KEY);

export function retrieveCustomer(customer: string | Stripe.customers.ICustomer) {
    if (typeof customer !== 'string') {
        return customer;
    } else {
        return StripeInstance.customers.retrieve(customer);
    }
}

export function retrieveInvoice(invoice: string | Stripe.invoices.IInvoice) {
    if (typeof invoice !== 'string') {
        return invoice;
    } else {
        return StripeInstance.invoices.retrieve(invoice);
    }
}

export function getEmptybilling() {
    const nowMS = new Date().getTime();
    const nowSec = Math.round(nowMS / 1000);

    return {
        cancelAt: nowSec,
        subscriptionId: null,
        plan: null,
        planCategory: null,
        maxClients: 0,
        nextPaymentAttempt: null,
    };
}

export async function getCustomerActiveSubscription(customer: Stripe.customers.ICustomer): Promise<Stripe.subscriptions.ISubscription> {
    const subscriptions = customer.subscriptions.data;
    let subscription: Stripe.subscriptions.ISubscription;

    for (let i = 0; i < subscriptions.length; i++) {
        const s = subscriptions[i];

        if (s.status !== 'canceled') {
            subscription = s;
            break;
        }
    }

    return subscription;
}