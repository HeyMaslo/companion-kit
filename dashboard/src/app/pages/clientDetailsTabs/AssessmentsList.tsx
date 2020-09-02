import React from 'react';
import AssessmentsCard from './AssessmentsCard';
import { AssessmentCard } from 'app/viewModels/Assessments';
import { View } from 'app/common/components';

export type CardProps = {
    model: AssessmentCard,
};

type Props = {
    list: readonly AssessmentCard[],
    className?: string,
};

export default function AssessmentsList(props: Props) {
    const { list, className } = props;

    return (
        <View className={className || ''}>
            {
                list.map(cardViewModel => {
                    return (
                        <AssessmentsCard
                            key={cardViewModel.type} // type should be unique across the list
                            model={cardViewModel}
                        />
                    );
                })
            }
        </View>
    );
}
