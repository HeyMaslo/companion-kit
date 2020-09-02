import React from 'react';
import * as Routes from 'app/constants/routes';
import history from 'app/services/history';
import { View, Text } from 'app/common/components';
import { IntakeFormCard } from 'app/viewModels/AssessmentItemPage';

export type CardProps = {
    model: IntakeFormCard,
    clientId: string,
};

export default class IntakeForm extends React.Component<CardProps> {

    goToInner = () => {
        const { id, type } = this.props.model;
        const { clientId } = this.props;
        history.push(Routes.ClientDetails.IntakeFormInner(clientId, type, id));
    }

    render() {
        const { recommendation, score, date, type } = this.props.model;

        return (
            <View className={`intake-form-card ${type}`} onClick={this.goToInner}>
                <View className="title-wrap">
                    <View className="result-wrap">
                        <Text className={`label-btn2 type2 depres-severity ${recommendation.title.toLowerCase().replace(/ /g, '-')}`}>{recommendation.title}</Text>
                        <Text className="desc-5 score">Score: {score}</Text>
                    </View>
                    <Text className="desc-5 type3 date">{date}</Text>
                </View>
                <Text className="label-client-item recommend">{recommendation.action}</Text>
            </View>
        );
    }
}
