import React from 'react';
import { observer } from 'mobx-react';
import * as Routes from 'app/constants/routes';
import history from 'app/services/history';
import { View, Text, Image } from 'app/common/components';
import { CardProps } from './AssessmentsList';
import innerArow from 'assets/img/inner-arrow.svg';
import logger from 'common/logger';

@observer
export default class AssessmentsCard extends React.Component<CardProps> {

    goToInner = () => {
        const { clientId, type } = this.props.model;
        history.push(Routes.ClientDetails.AssessmentInner(clientId, type));
    }

    render() {
        const { name, lastItem, status } = this.props.model;
        const { title, action } = lastItem != null && lastItem.recommendation;

        return (
            <View className="assessment-card" onClick={this.goToInner}>
                <View className="header-wrap">
                    <View className="title-wrap">
                        <Text className="title-h2 type5 name">{name}</Text>
                        <Text className="desc-3 type4 status">{status}</Text>
                        <Image src={innerArow} className="arrow"/>
                    </View>
                </View>
                <View className="inner-wrap">
                    {
                        lastItem != null ?
                            <>
                                <View className={`title-wrap ${lastItem.type}`}>
                                    <View className="recom-block">
                                        <Text className={`title label-btn2 type2 severity ${title.toLowerCase().replace(/ /g, '-')}`}>{title}</Text>
                                        <Text className="desc-5 score">{`Score: ${lastItem.score}`}</Text>
                                    </View>
                                    <Text className="desc-5 type3 date">{lastItem.date}</Text>
                                </View>
                                <View className="desc-wrap">
                                    <Text className="desc label-client-item">{action}</Text>
                                </View>
                            </>
                        :
                            <>
                                <Text className="title title-wrap label-btn2 type2">No results</Text>
                                <Text className="desc label-client-item">The client has not passed assessment yet</Text>
                            </>
                    }
                </View>
            </View>
        );
    }
}
