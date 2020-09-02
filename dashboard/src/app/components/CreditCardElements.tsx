import React from 'react';
import {
    injectStripe,
    ReactStripeElements,
    CardElement,
    CardNumberElement,
    CardExpiryElement,
    CardCVCElement,
    Elements,
} from 'react-stripe-elements';
import { View } from 'app/common/components';
import logger from 'common/logger';

type Props = {
    onCardSave: (token: stripe.Token) => void,
    onError: (err: stripe.Error & { decline_code?: string; }) => void,
    ref?: any;
};

/** TODO: use CardElement in onboarding */

const styles = {
    base: {
        color: '#877DC2',
        fontFamily: 'Helvetica Neue',
        fontSize: '16px',
        lineHeight: '24px',
        fontWeight: 300,
        '::placeholder': {
            color: '#877DC2',
        },
    },
    // focus: {
    //     color: '#FFF',
    // },
};

class CreditCardElements extends React.Component<Props & ReactStripeElements.InjectedStripeProps> {
    onSave = async () => {
        const res = await this.props.stripe.createToken();
        const { token } = res;

        if (res.error) {
            logger.log('[CreditCardRow: token creation error]', res);

            this.props.onError(res.error);
            return;
        }

        logger.log('[CreditCardRow: tokenCreated]', token.id);

        this.props.onCardSave(token);
    }

    render() {
        return (
            <>
                <View className="card-number-wrap card-item">
                    <View className="label-btn4 type1">Card Number</View>
                    <View className="card-number focus-item">
                        <CardNumberElement style={styles} placeholder="0123456789123456" />
                        <View className="input-border"></View>
                    </View>
                </View>
                <View className="card-expiry-wrap card-item">
                    <View className="label-btn4 type1">Expiry Date</View>
                    <View className="card-expiry focus-item">
                        <CardExpiryElement style={styles} />
                        <View className="input-border"></View>
                    </View>
                </View>
                <View className="card-cvc-wrap card-item">
                    <View className="label-btn4 type1">CVV</View>
                    <View className="card-cvc focus-item">
                        <CardCVCElement style={styles} placeholder="3 Digits" />
                        <View className="input-border"></View>
                    </View>
                </View>
            </>
        );
    }
}

export default injectStripe(CreditCardElements, { withRef: true });