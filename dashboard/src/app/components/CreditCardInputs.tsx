import React from 'react';
import { InputObservable } from 'app/common/components/Input';
import { observer } from 'mobx-react';
import CreditCardViewModel from 'app/viewModels/CreditCard';
import { View } from '../common/components';

type Props = {
    model: CreditCardViewModel;
};

function CreditCardInputs(props: Props) {
    const { model } = props;
    return (
        <View className="inputs-wrap inputs-wrap--blue-bg">
            <InputObservable
                className="input-wrap--card-number"
                model={model.cardNumber}
                label="card number"
                mask="9999 9999 9999 9999"
                maskChar="0"
                alwaysShowMask={true}
            />

            <InputObservable
                className="input-wrap--expiry-date"
                model={model.expiryDate}
                label="expiry date"
                mask="99/99"
                maskChar="0"
                alwaysShowMask={true}
            />

            <InputObservable
                className="input-wrap--cvv"
                model={model.cvv}
                label="cvv"
                mask="999"
                maskChar="0"
                alwaysShowMask={true}
            />
        </View>
    );
}

export default observer(CreditCardInputs);
