import React from 'react';
import { View, Text, Image, Button } from 'app/common/components';
import { Plans, PlansCategories, PlanUI } from 'common/models';
import History from 'app/services/history';
import * as Routes from 'app/constants/routes';
import { months } from 'common/utils/dateHelpers';

import trialIcon from 'assets/img/trial-icon.svg';
import subscriptionIcon from 'assets/img/subscription-icon.svg';
import subscriptionCancelIcon from 'assets/img/subsc-cancel-icon.svg';
import settingsIcon from 'assets/img/settings-profile-icon.svg';
import logger from 'common/logger';

type Props = {
    plan: Plans;
    planCategory: PlansCategories;
    trialEnd: number;
    cancelAt: number;
    nextPaymentAttempt: number;
};

const PlanTexts = {
    [PlansCategories.starter]: 'Starter',
    [PlansCategories.pro1]: 'Pro1',
    [PlansCategories.pro2]: 'Pro2',
};

const PlanPrice = {
    [Plans.monthly]: {
        [PlansCategories.starter]: `$${PlanUI[Plans.monthly][PlansCategories.starter].price}/month`,
        [PlansCategories.pro1]: `$${PlanUI[Plans.monthly][PlansCategories.pro1].price}/month`,
        [PlansCategories.pro2]: `$${PlanUI[Plans.monthly][PlansCategories.pro2].price}/month`,
    },
    [Plans.annual]: {
        [PlansCategories.starter]: `$${PlanUI[Plans.annual][PlansCategories.starter].price}/year`,
        [PlansCategories.pro1]: `$${PlanUI[Plans.annual][PlansCategories.pro1].price}/year`,
        [PlansCategories.pro2]: `$${PlanUI[Plans.annual][PlansCategories.pro2].price}/year`,
    },
};

export default function SubscriptionCard(props: Props) {
    let icon: string,
        price: string,
        subtitle: string,
        titleDate: string,
        date: Date | string;

    const now = new Date().getTime() / 1000;

    const { plan, planCategory, trialEnd, cancelAt, nextPaymentAttempt } = props;

    const priceMonthly = PlanPrice[Plans.monthly];
    const priceAnnual = PlanPrice[Plans.annual];

    const title = PlanTexts[planCategory] || 'no subscription';

    if (plan !== Plans.canceled) {
        price = plan === Plans.monthly ? priceMonthly[planCategory] : priceAnnual[planCategory];
    }

    const showTrial = !!trialEnd && !cancelAt && now < trialEnd;
    const showCancel = !!cancelAt && now < cancelAt;

    if (showTrial) {
        icon = trialIcon;
        const diffTime = Math.abs(trialEnd - now);
        const restDays = Math.ceil(diffTime / (60 * 60 * 24));
        subtitle = `Free for ${restDays} ${restDays === 1 ? 'day' : 'days'}`;
        titleDate = 'First Billing';
        date = new Date(trialEnd * 1000);
    } else if (showCancel) {
        icon = subscriptionCancelIcon;
        subtitle = 'Cancelled';
        titleDate = 'Valid Until';
        date = new Date(cancelAt * 1000);
    } else {
        icon = subscriptionIcon;
        subtitle = price;
        titleDate = 'Next Billing';
        date = nextPaymentAttempt != null ? new Date(nextPaymentAttempt * 1000) : null;
    }

    const formattedDate = date != null ? `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}` : '';

    return (
        <View className="subscription-card">
            <View className="main-content">
                <Image className="icon" src={icon}/>
                <View className="text-block">
                    <Text className="title desc-1">{title}</Text>
                    <Text className="subtitle label-client-item">{subtitle}</Text>
                </View>
                <View className="action-block">
                    <Button
                        className="action-button"
                        icon={settingsIcon}
                        onClick={() => History.push(Routes.Pricing)}
                    />
                </View>
            </View>
            {date && (
                <View className="bottom-content">
                    <Text className="title-date desc-5">{titleDate}</Text>
                    <Text className="date desc-5">{formattedDate}</Text>
                </View>
            )}
        </View>
    );
}
