import React from 'react';
import History from 'app/services/history';
import { Container, View, Text, Page, Image, ScrollableContainer } from 'app/common/components';
import AudioPlayer from 'app/components/AudioPlayer';
import { RouteComponentProps } from 'react-router';
import { formatTimespan } from 'common/utils/dateHelpers';
import JournalInnerViewModel from 'app/viewModels/JournalInnerPage';
import AudioPlayerViewModel from 'app/viewModels/AudioPlayer';
import SessionInnerViewModel from 'app/viewModels/SessionInnerViewModel';
import { autorun } from 'mobx';
import ProjectImages from 'app/helpers/images';

type Props = RouteComponentProps<{ clientId: string, journalId: string, sessionId: string }> & {

};

type State = {
    title: string,
    transcription: string,
    date: string,
    audio: AudioPlayerViewModel,
    hasAudio: boolean,
};

class Transcription extends React.Component<Props, State> {
    state: State = { } as State;
    private _unsubscriber: () => void = null;

    componentDidMount() {
        const { clientId, journalId, sessionId } = this.props.match.params;

        if (journalId) {
            // this._journalViewModel = new JournalInnerViewModel();
            const vm = new JournalInnerViewModel();
            vm.setJournalEntry(clientId, journalId);
            this._unsubscriber = autorun(() => {
                if (vm.entryExists === false) {
                    this._onBackArrowClick();
                }

                if (vm.journalItem) {
                    const { transcription, question, date, audioPlayer, fileType } = vm.journalItem;
                    this.setState({
                        title: question,
                        transcription: transcription,
                        date: date,
                        audio: audioPlayer,
                        hasAudio: fileType === 'audio',
                    });
                }
            });
        } else if (sessionId) {
            const vm = new SessionInnerViewModel();
            vm.setSessionEntry(clientId, sessionId);
            this._unsubscriber = autorun(() => {
                if (vm.entryExists === false) {
                    this._onBackArrowClick();
                }

                if (vm.sessionItem) {
                    const { title, transcription, date, audioPlayer, fileType } = vm.sessionItem;
                    this.setState({
                        title: title,
                        transcription: transcription,
                        date: date,
                        audio: audioPlayer,
                        hasAudio: fileType === 'audio',
                    });
                }
            });
        }

    }

    componentWillUnmount() {
        if (this._unsubscriber) {
            this._unsubscriber();
        }
    }

    private _onBackArrowClick = () => {
        History.goBack();
    }

    render() {
        const { title, audio, date, transcription, hasAudio } = this.state;

        return (
            <Page className="transcr-page">
                <Container>
                    <View onClick={this._onBackArrowClick} className="arrow-link">
                        <Image className="arrow-icon" src={ProjectImages.backArrow} />
                    </View>
                    <View className="text-content">
                        <View className="text-block">
                            <Text className="description type1 desc-2">
                                { title || '' }
                                { audio && audio.duration && <Text className="desc-2 duration">&nbsp;{formatTimespan(audio.duration)}</Text>}
                            </Text>
                        </View>
                        <View className="time-wrap">
                            <Image className="clock-icon" src={ProjectImages.clockSessionInner} />
                            <Text className="date-details label-tag white">{date || ''}</Text>
                        </View>
                        <ScrollableContainer className="transcription-scrollable">
                            <Text className="transcription-text desc-3">
                                {transcription || ''}
                            </Text>
                        </ScrollableContainer>
                    </View>
                </Container>
                { hasAudio &&
                    <View className="player-wrap">
                        <Container className="player-container">
                            <AudioPlayer model={audio} skipTitle />
                        </Container>
                    </View>
                }
            </Page>
        );
    }
}

export default Transcription;
