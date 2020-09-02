import React from 'react';
import { View, Text, Image } from 'app/common/components';
import { Plans, PlansCategories } from 'common/models';
import trialIcon from 'assets/img/trial-icon.svg';
import subscriptionIcon from 'assets/img/subscription-icon.svg';

type Props = {
    plan: Plans;
    planCategory: PlansCategories;
    showTrial: boolean;
};

const PlanTexts = {
    [Plans.monthly]: {
        [PlansCategories.starter]: 'Monthly starter',
        [PlansCategories.pro1]: 'Monthly pro1',
        [PlansCategories.pro2]: 'Monthly pro2',
    },
    [Plans.annual]: {
        [PlansCategories.starter]: 'Annual starter',
        [PlansCategories.pro1]: 'Annual pro1',
        [PlansCategories.pro2]: 'Annual pro2',
    },
};

export default function SubscriptionLabel(props: Props) {
    let title: string;
    const { plan, planCategory } = props;

    const showTrial = props.showTrial;

    switch (plan) {
        case Plans.annual:
            title = PlanTexts[Plans.annual][planCategory];
            break;
        case Plans.monthly:
            title = PlanTexts[Plans.monthly][planCategory];
            break;
        default:
            title = 'no subscription found';
    }

    return (
        <View className="subscription-label">
            { showTrial ? (
                <Image className="subscription-label-icon" src={trialIcon} />
            ) : (
                <Image className="subscription-label-icon" src={subscriptionIcon} />
            )}
            <Text className="label-btn2 subscription-label-text">{ showTrial ? 'trial period' : title}</Text>
        </View>
    );
}
