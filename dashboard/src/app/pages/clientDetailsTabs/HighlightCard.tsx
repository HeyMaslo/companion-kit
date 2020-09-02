import React from 'react';
import { View, Image, Text } from 'app/common/components';
import { CardProps } from './JournalList';
import AudioPlayer from 'app/components/AudioPlayer';
import { MoodImages } from 'app/helpers/moods';
import * as Routes from 'app/constants/routes';
import history from 'app/services/history';
import { observer } from 'mobx-react';
import { EntryFileType } from 'app/viewModels/ClientEntryItem';

type Props = CardProps & { active: boolean };

@observer
export default class InsightsCard extends React.Component<Props> {
    _playerRef: React.RefObject<AudioPlayer> = React.createRef();
    _player: any;

    componentDidMount() {
        this._player = this._playerRef.current;
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.active && !this.props.active) {
            this._player.stop();
        }
    }

    goToInner = () => {
        const { id } = this.props.model;
        const { clientId } = this.props;

        history.push(Routes.ClientDetails.JournalInner(clientId, id));
    }

    getTranscriptionText(fileType: EntryFileType) {
        switch (fileType) {
            case 'audio':
                return 'Voice Check-in';
                break;
            case 'image':
                return 'Picture Check-in';
                break;
            default:
                return this.props.model.transcription;
                break;
        }
    }

    render() {
        const { model } = this.props;
        const { mood, transcription, audioPlayer, fileType, active } = model;
        const hasAudio = fileType === 'audio';

        return (
            <View className={`highlight-card ${fileType} ${active ? 'isPlaying' : ''}`}>
                <View className="redirect-layer" onClick={this.goToInner} />
                <View className="top-block">
                    <Image className="mood" src={MoodImages[mood]} />
                    <Text className="desc-3 date">{model.date}</Text>
                    <Text className="desc-3 transcription">{this.getTranscriptionText(fileType)}</Text>
                </View>

                {hasAudio && <AudioPlayer model={audioPlayer} ref={this._playerRef} />}
            </View>
        );
    }
}