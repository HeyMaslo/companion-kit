import { UserProfile } from 'common/models';
import { categoryToClientsCount } from 'common/models/Plans';

export function userHasAccess(user: UserProfile, now = new Date()): boolean {
    if (process.appFeatures.BILLING_DISABLED) {
        return true;
    }

    if (!user) {
        return false;
    }

    const { billing } = user;

    if (user.freeAccess) {
        return true;
    }

    if (billing == null) {
        return false;
    }

    const { subscriptionId, stripeUid, trialPeriondEnd, cancelAt, paymentFailed } = billing;

    if (paymentFailed) {
        return false;
    }

    if (!stripeUid || !subscriptionId) {
        return false;
    }

    // const now = TimeHelper.now / 1000;
    const nowSec = (now || new Date()).getTime() / 1000;
    if (nowSec < trialPeriondEnd) {
        return true;
    }

    return cancelAt == null || nowSec < cancelAt;
}

export function getMaxClients(user: UserProfile, now = new Date()): number | 'unlimited' {
    if (!userHasAccess(user, now)) {
        return 0;
    }

    if (user.maxClientsCount != null) {
        return user.maxClientsCount;
    }

    if (user.freeAccess || process.appFeatures.BILLING_DISABLED) {
        return 'unlimited';
    }

    if (user.billing == null || user.billing.plan == null) {
        return 0;
    }

    if (user.billing.planCategory) {
        return categoryToClientsCount[user.billing.planCategory] || 0;
    }

    return 'unlimited';
}