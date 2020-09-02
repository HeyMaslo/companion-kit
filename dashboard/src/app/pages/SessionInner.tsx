import React from 'react';
import { observer } from 'mobx-react';
import { RouteComponentProps } from 'react-router';
import { Container, View, Text, Page, Image, Button } from 'app/common/components';
import History from 'app/services/history';
import GradientChart from 'app/components/GradientStickChart';
import SessionInnerViewModel from 'app/viewModels/SessionInnerViewModel';
import AudioPlayer from 'app/components/AudioPlayer';

import BubbleChart from 'app/components/BubbleChart';
import BubbleChartWrapper from 'app/components/BubbleChartWrapper';
import ButtonArrow from 'app/components/ButtonArrow';
import ProjectImages from 'app/helpers/images';

import BubblesPlaceholder from 'assets/img/bubbles-placeholder2.svg';
import logger from 'common/logger';

type Props = RouteComponentProps<{ clientId: string, sessionId: string }>;

type SessionCardProps = {
    firstPercents: number;
    firstDescription: string;
    secondPercents: number;
    secondDescription: string;
};

function SessionCard(props: SessionCardProps) {
    return (
        <View className="session-card">
            <View className="card-data green">
                <Text className="percent-data title-h2">{props.firstPercents}<Text className="percent">%</Text></Text>
                <Text className="percent-description">{props.firstDescription}</Text>
            </View>
            <View className="card-data">
                <Text className="percent-data title-h2">{props.secondPercents}<Text className="percent">%</Text></Text>
                <Text className="percent-description">{props.secondDescription}</Text>
            </View>
        </View>
    );
}

@observer
export default class SessionInner extends React.Component<Props> {
    private readonly _viewModel = new SessionInnerViewModel();

    componentDidMount() {
        this.forceUpdate();
    }

    componentDidUpdate() {
        const { sessionId, clientId } = this.props.match.params;
        this._viewModel.setSessionEntry(clientId, sessionId);

        if (this._viewModel.entryExists === false) {
            this._onBackArrowClick();
        }
    }

    private _onBackArrowClick = () => {
        History.goBack();
    }

    renderContent() {
        if (!this._viewModel.sessionItem) {
            return null;
        }

        const { firstName } = this._viewModel;

        const {
            title,
            duration,
            date,
            spokenPercent,
            silencePercent,
            audioPlayer,
            fileType,
            chart,
            goToTranscription,
            loading,
            wordsFilter,
            filteredWords,
        } = this._viewModel.sessionItem;
        const hasAudio = fileType === 'audio';

        return (
            <>
                <Container className="heading-container">
                    <View onClick={this._onBackArrowClick} className="arrow-link">
                        <Image className="arrow-icon" src={ProjectImages.backArrow} />
                    </View>
                    <View className="text-content">
                        <View className="text-block">
                            <Text className="title title-h2">
                                <Text className="title title-h2 type1">
                                    {title}{duration && ', '}
                                </Text>
                                <Text className="title title-h2 type6">
                                    {duration || null}
                                </Text>
                            </Text>
                            <View className="icons">
                                <View className="entries">
                                <Image src={ProjectImages.clockSessionInner} alt="clock icon" />
                                    <Text className="description label-tag">
                                        {date}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View className="cards-wrap">
                            <SessionCard
                                firstPercents={spokenPercent}
                                firstDescription="spoken"
                                secondPercents={silencePercent}
                                secondDescription="silence"
                            />
                            {/* <SessionCard
                                firstPercents={clientSpeak}
                                firstDescription="client"
                                secondPercents={coachSpeak}
                                secondDescription="you"
                            /> */}
                        </View>
                        { hasAudio && <AudioPlayer model={audioPlayer} skipTitle />}
                        {/* <Text className="description label-tag">Channels count: {channelsCount}</Text> */}
                    </View>
                    <View className="view-transcription"
                        onClick={goToTranscription}
                    >
                        <Image src={ProjectImages.transcriptionIcon} alt="comment window with pencil" />
                        <Text className="label-btn2">view a transcription</Text>
                    </View>
                </Container>
                <View className="white-part">
                    { !loading ? (
                        <>
                            <Container className="gradient-chart-container">
                                <Text className="title-h2 type5">Sentiment over time</Text>
                            </Container>
                            <GradientChart model={chart} />
                            <Container className="content">
                                <BubbleChartWrapper
                                    clientName={firstName}
                                    filterModel={wordsFilter}
                                >
                                    {filteredWords.length && filteredWords.length > 0
                                        ? (
                                        <BubbleChart
                                            data={filteredWords}
                                            height={500}
                                        />
                                        ) : (
                                            <Image alt="No bubbles there. Yet." src={ProjectImages.bubblePlaceholder} className="image-placeholder" />
                                        )
                                    }
                                </BubbleChartWrapper>
                            </Container>
                        </>
                    ) : (
                        <Container className="content">
                            <Text className="desc-2 type2">No data yet...</Text>
                        </Container>
                    )}
                    <View className="btn-wrap">
                        <ButtonArrow
                            typeButton="secondary"
                            title="delete this file"
                            titleClassName="type5"
                            onClick={this._viewModel.deleteSession}
                        />
                        <Button onClick={this._viewModel.manualProcess}>Process this entry again (will take a while)</Button>
                    </View>
                </View>
            </>
        );
    }

    render() {
        const { inProgress } = this._viewModel;
        return (
            <Page inProgress={inProgress} className="client-overview-page session-inner inner-page">
                {this.renderContent()}
            </Page>
        );
    }
}
