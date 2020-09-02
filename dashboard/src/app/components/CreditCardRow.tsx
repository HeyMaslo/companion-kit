import React from 'react';
import { View, Input, Image, Text } from 'app/common/components';
import { Elements } from 'react-stripe-elements';
import CreditCardicon from 'assets/img/credit-card-icon.svg';

import CreditCardElements from './CreditCardElements';

type Props = {
    editing: boolean;
    last4: string;
    buttonTitle?: string;

    onSelectClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
    onCardSave: (token: stripe.Token) => void,
    onError: (err: stripe.Error & { decline_code?: string; }) => void,
};

export default function CreditCardRow(props: Props) {
    const { editing, onSelectClick, last4, onCardSave, buttonTitle, onError } = props;
    return (
        <View className="credit-card-row">
            {editing
                ? (
                    <Elements>
                        <CreditCardElements onCardSave={onCardSave} onError={onError} />
                    </Elements>
                )
                : (
                    <>
                        <Input
                            disabled
                            value={last4 ? `●●●● ●●●● ●●●● ${last4}` : 'You can add a credit card on the billing info screen'}
                            className="input-wrap--card-number"
                            label="card number"
                        />

                        {buttonTitle && (
                            <View className="edit-card-button title input-label" onClick={onSelectClick}>
                                <Image className="credit-card-icon" src={CreditCardicon} />
                                <Text>{buttonTitle}</Text>
                            </View>
                        )}
                    </>
                )
            }
        </View>
    );
}