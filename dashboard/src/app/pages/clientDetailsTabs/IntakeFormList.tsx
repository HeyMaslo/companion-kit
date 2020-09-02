import React, { ReactNode } from 'react';
import IntakeForm from './IntakeForm';
import { IntakeFormCard } from 'app/viewModels/AssessmentItemPage';
import { View } from 'app/common/components';

type Props = {
    list: readonly IntakeFormCard[],
    clientId: string,
    className?: string,
};

export default function IntakeFormList(props: Props) {
    const { list, clientId, className } = props;

    return (
        <View className={className || ''}>
            {
                list.map(cardViewModel => {
                    const phq9id = cardViewModel.id;

                    return (
                        <IntakeForm
                            key={phq9id}
                            model={cardViewModel}
                            clientId={clientId}
                        />
                    );
                })
            }
        </View>
    );
}
