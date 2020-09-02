import React from 'react';
import AudioCard from './AudioCard';

import { Image } from 'app/common/components';
import { MoodImages } from 'app/helpers/moods';
import * as Routes from 'app/constants/routes';
import history from 'app/services/history';
import { JournalItem } from 'app/viewModels/ClientEntryItem';
import { CardProps } from './JournalList';

export default class JournalAudioCard extends AudioCard<CardProps> {
    goToInner = () => {
        const { id } = this.props.model;
        const { clientId } = this.props;
        history.push(Routes.ClientDetails.JournalInner(clientId, id));
    }

    getInfoBlock = () => {
        const { mood } = this.props.model;

        return <Image className={'journal-card-mood-image'} src={MoodImages[mood]} />;
    }
}