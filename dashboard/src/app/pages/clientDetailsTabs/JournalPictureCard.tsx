import React from 'react';
import * as Routes from 'app/constants/routes';
import history from 'app/services/history';
import { Image } from 'app/common/components';
import { MoodImages } from 'app/helpers/moods';
import { View, Text } from 'app/common/components';
import Card from './Card';
import { CardProps } from './JournalList';

import PictureIcon from 'assets/img/picture-icon.svg';
import LockIcon from 'assets/img/lock.svg';

export default class JournalPictureCard extends Card<CardProps> {

    goToInner = () => {
        const { id } = this.props.model;
        const { clientId } = this.props;
        history.push(Routes.ClientDetails.JournalInner(clientId, id));
    }

    getInfoBlock = () => {
        const { mood } = this.props.model;

        return <Image className={'journal-card-mood-image'} src={MoodImages[mood]} />;
    }

    getContent() {
        const { isPrivate, date } = this.props.model;

        return (
            <View className="transcription-card-content picture-card-content">
                <Image src={PictureIcon} />
                <View className="text-block">
                    <Text className="desc-3 type1">Picture Check-in</Text>
                    <Text className="desc-3 type4">{date}</Text>
                </View>
                {isPrivate &&
                    (
                        <View className="private-entry">
                            <Image src={LockIcon} className="private-entry-icon" />
                            <Text className="desc-5 private-entry-text">This story is not available for viewing.</Text>
                        </View>
                    )
                }
            </View>
        );
    }
}
