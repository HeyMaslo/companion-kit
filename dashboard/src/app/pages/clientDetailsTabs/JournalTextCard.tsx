import React from 'react';
import * as Routes from 'app/constants/routes';
import history from 'app/services/history';
import { Image } from 'app/common/components';
import { MoodImages } from 'app/helpers/moods';
import { View, Text } from 'app/common/components';
import Card from './Card';
import { CardProps } from './JournalList';

import TextIcon from 'assets/img/text-icon.svg';
import LockIcon from 'assets/img/lock.svg';

export default class JournalTextCard extends Card<CardProps, { textExpanded: boolean }> {

    state = {
        textExpanded: false,
    };

    goToInner = () => {
        const { id } = this.props.model;
        const { clientId } = this.props;
        history.push(Routes.ClientDetails.JournalInner(clientId, id));
    }

    getInfoBlock = () => {
        const { mood } = this.props.model;

        return <Image className={'journal-card-mood-image'} src={MoodImages[mood]} />;
    }

    private onTextClick = () => {
        this.setState({ textExpanded: !this.state.textExpanded });
    }

    getContent() {
        const { question, transcription, isPrivate, date } = this.props.model;

        return (
            <View className="transcription-card-content">
                <Image src={TextIcon} />
                <View className="text-block">
                    <Text className="desc-3 type1">Text Check-in</Text>
                    <Text className="desc-3 type4">{date}</Text>
                </View>
                {!isPrivate ? (
                    <View className="marquee" onClick={this.onTextClick}>
                        <Text className={`desc-5 transcription-card-text ${this.state.textExpanded ? 'expanded' : ''}`} >{transcription}</Text>
                    </View>
                ) : (
                    <View className="private-entry">
                        <Image src={LockIcon} className="private-entry-icon" />
                        <Text className="desc-5 private-entry-text">This story is not available for viewing.</Text>
                    </View>
                )}
            </View>
        );
    }
}
