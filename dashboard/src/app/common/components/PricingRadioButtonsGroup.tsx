import React from 'react';
import { observer } from 'mobx-react';
import PricingCard from 'app/common/components/PricingCard';
import RadioButtonsGroup from './RadioButtonsGroup';
import { Plans, PlanUI, PlansCategories } from 'common/models/Plans';
import logger from 'common/logger';

type Props = {
    selectedPlan: Plans.annual | Plans.monthly;
    currentCategory: PlansCategories;
    currentPlan: Plans;
    acitveUsersCount: number;
};

@observer
export default class PricingRadioButtonsGroup extends RadioButtonsGroup<Props> {

    renderRadioButtons(radioButtons: string[]) {
        const { model, selectedPlan, currentCategory, currentPlan, acitveUsersCount } = this.props;

        return radioButtons.map((planCategory: PlansCategories, index) => {
            const planUIObj = PlanUI[this.props.selectedPlan];
            const uiObj = planUIObj && planUIObj[planCategory];
            const isCurrent = planCategory === currentCategory && selectedPlan === currentPlan;
            // TODO: old users?
            const disabled = !!uiObj ? acitveUsersCount > uiObj.clientsNumber : false;

            return (
                <PricingCard
                    key={index}
                    onClick={i => this._onRadioClick(i)}
                    label={planCategory}
                    index={index}
                    checked={model.index === index}
                    price={uiObj && uiObj.price}
                    subtitle={uiObj && uiObj.subtitle}
                    clientsNumber={uiObj && uiObj.clientsNumber}
                    selectedPlan={selectedPlan}
                    isCurrentPlan={isCurrent}
                    disabled={disabled}
                />
            );
        });
    }
}