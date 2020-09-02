import { Plans, PlansCategories } from 'common/models';

export type BillingInfo = {
    stripeUid: string;
    trialPeriondEnd: number;

    subscriptionId: string;
    planId: string;

    plan: Plans;
    planCategory: PlansCategories;

    defaultSource: string;
    last4: string;

    lastChecked: Date;
    cancelAt?: number;

    paymentFailed?: boolean;
    nextPaymentAttempt?: number;

    maxClients: number;
    freeAccess?: boolean;
};
