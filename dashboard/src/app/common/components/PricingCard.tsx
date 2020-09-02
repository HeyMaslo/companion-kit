import React from 'react';
import { observer } from 'mobx-react';
import Text from './Text';
import View from './View';
import Image from './Image';

import checkedIcon from 'assets/img/checked-white.svg';

interface PricingCardProps {
    className?: string;
    onClick: (index: number) => void;
    label: string;
    subtitle: string,
    price: number;
    clientsNumber: number;
    selectedPlan: string;
    checked: boolean;
    index: number;
    isCurrentPlan: boolean;
    disabled?: boolean;
}

@observer
export default class PricingCard extends React.Component<PricingCardProps> {

    _onClick = () => {
        if (this.props.disabled) {
            return;
        }

        this.props.onClick(this.props.index);
    }

    render() {
        const { checked, className, label, price, subtitle, clientsNumber, selectedPlan, isCurrentPlan, disabled } = this.props;
        const radioButtonDefaultClass = `pricing-item ${className || ''} ${checked ? 'checked' : 'not-checked'} ${disabled ? 'disabled' : ''}`;
        const period = selectedPlan !== 'annual' ? 'month' : 'year';

        return (
            <View className={radioButtonDefaultClass} onClick={this._onClick}>
                {isCurrentPlan &&
                    <View className="pricing-item-tooltip current-plan">
                        <Image className="checked-icon" src={checkedIcon} />
                        <Text className="label-btn4 type1">Your Current Plan</Text>
                    </View>
                }
                {disabled &&
                    <View className="pricing-item-tooltip clients-limit">
                        <Text className="label-btn4 type1">You have too many clients</Text>
                    </View>
                }
                <View className="pricing-item-content">
                    <View className="radio-button-circle" />
                    <Text className="desc-1 type1 pricing-item-title">{label}</Text>
                    <Text className="desc-3 pricing-item-subtitle">{subtitle}</Text>
                    <Text className="price-title pricing-item-price">
                        ${price}
                        <Text className="period">/{period}</Text>
                    </Text>
                    <Text className="label-btn4 pricing-item-client-limit">{`${clientsNumber} Client Accounts`}</Text>
                </View>
            </View>
        );
    }
}
