import React from 'react';
import AudioPlayer from 'app/components/AudioPlayer';
import Card, { CardProps } from './Card';
import { View, Text, Image } from 'app/common/components';

import LockIcon from 'assets/img/lock.svg';
import PlayIcon from 'assets/img/play-icon.svg';
import { JournalItem, SessionItem } from 'app/viewModels/ClientEntryItem';

type Props = {
    model: JournalItem | SessionItem,
};

export default class AudioCard<TP = {}, TS = {}> extends Card<Props & TP, TS> {

    _playerRef: React.RefObject<AudioPlayer> = React.createRef();
    _player: any;

    componentDidMount() {
        this._player = this._playerRef.current;
    }

    componentDidUpdate(prevProps: CardProps) {
        if (prevProps.active && !this.props.active) {
            this._player.stop();
        }
    }

    getContent() {
        const { model } = this.props;
        const { audioPlayer, date } = this.props.model;

        let isPrivate = false;

        if (model instanceof JournalItem) {
            ({ isPrivate } = model);
        }

        if (isPrivate) {
            return (
                <View className="private-audio-heading">
                    <View className="title-block">
                        <Image src={PlayIcon} className="play" />
                        <View className="text-block">
                            <Text className="desc-3 type1">Voice Check-in</Text>
                            <Text className="desc-3 type4">{date}</Text>
                        </View>
                    </View>
                    <View className="private-entry">
                        <Image src={LockIcon} className="private-entry-icon" />
                        <Text className="desc-5 private-entry-text">This story is not available for listening.</Text>
                    </View>
                </View>
            );
        }

        return <AudioPlayer model={audioPlayer} ref={this._playerRef} />;
    }
}