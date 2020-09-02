import React from 'react';
import { observer } from 'mobx-react';
import { RouteComponentProps } from 'react-router';
import { Container, View, Text, Page, Image } from 'app/common/components';
import History from 'app/services/history';
import JournalInnerViewModel from 'app/viewModels/JournalInnerPage';
import AudioPlayer from 'app/components/AudioPlayer';
import { MoodImages } from 'app/helpers/moods';
import LocationStrings from 'common/localization/LocationStrings';
import Moods from 'common/models/Moods';
import BubbleChart from 'app/components/BubbleChart';
import BubbleChartWrapper from 'app/components/BubbleChartWrapper';
import ProjectImages from 'app/helpers/images';
import Localization from 'app/services/localization';

// @ts-ignore
import SimpleReactLightbox, { SRLWrapper } from 'simple-react-lightbox';

type Props = RouteComponentProps<{ clientId: string, journalId: string }>;

const optionsLightbox = {
    settings: {
        disablePanzoom: true,
        hideControlsAfter: false,
    },
    buttons: {
        showAutoplayButton: false,
        showDownloadButton: false,
        showFullscreenButton: false,
        showNextButton: false,
        showPrevButton: false,
        showThumbnailsButton: false,
    },
    thumbnails: {
        showThumbnails: false,
    },
    progressBar: {
        showProgressBar: false,
    },
};

@observer
export default class JournalInner extends React.Component<Props> {
    private readonly _viewModel = new JournalInnerViewModel();

    componentDidMount() {
        this.updateJournalEntry();
    }

    componentDidUpdate() {
        this.updateJournalEntry();
        if (this._viewModel.entryExists === false) {
            this._onBackArrowClick();
        }
    }

    private updateJournalEntry() {
        const { journalId, clientId } = this.props.match.params;
        this._viewModel.setJournalEntry(clientId, journalId);
    }

    private _onBackArrowClick = () => {
        History.goBack();
    }

    private _onKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.shiftKey && event.key === 'P') {
            this._viewModel.manualProcess();
        }
    }

    renderContent() {
        if (!this._viewModel.journalItem) {
            return null;
        }

        const {
            question, duration, location, date, mood,
            fileType, audioPlayer, goToTranscription, analyzedMood,
            clientFirstName,
            filteredWords: sortedWords,
            wordsFilter: filter,
            isPrivate,
        } = this._viewModel.journalItem;

        const hasAudio = fileType === 'audio';
        const hasImage = fileType === 'image';

        return (
            <SimpleReactLightbox>
                <Container className="heading-container">
                    <View onClick={this._onBackArrowClick} className="arrow-link">
                        <Image className="arrow-icon" src={ProjectImages.backArrow} />
                    </View>
                    <View className="text-content">
                        <View className="text-block">
                            <Text className="title desc-2">
                                <Text className="title desc-2 type1">
                                    {question}{duration && ', '}
                                </Text>
                                {duration || null}
                            </Text>
                            <View className="icons">
                                {
                                    LocationStrings[location] &&
                                    <View className="entries">
                                        <Image src={ProjectImages.pinSessionInner} alt="Map pin" />
                                        <Text className="description label-tag">
                                            {LocationStrings[location]}
                                        </Text>
                                    </View>
                                }
                                <View className="entries">
                                    <Image src={ProjectImages.clockSessionInner} alt="clock icon" />
                                    <Text className="description label-tag">
                                        {date}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View className="mood-cards-wrap">
                            <View className="card maslo">
                                <Image src={MoodImages[analyzedMood]}  />
                                <View className="card-text">
                                    <Text className="desc-3 type2"> {Moods.getTitle(analyzedMood)}</Text>
                                    <Text className="label-btn2">mood analyzed by {Localization.Current.DashboardProject.projectName}</Text>
                                </View>
                            </View>
                            <View className="card">
                                <Image src={MoodImages[mood]} />
                                <View className="card-text">
                                    <Text className="desc-3 type2">{Moods.getTitle(mood)}</Text>
                                    <Text className="label-btn2">Mood Selected By {Localization.Current.DashboardProject.clientName.singular}</Text>
                                </View>
                            </View>
                        </View>
                        {hasAudio && !isPrivate && <AudioPlayer model={audioPlayer} skipTitle />}
                    </View>
                    {
                        process.appFeatures.PICTURE_CHECKINS_ENABLED && hasImage ? (
                                    <SRLWrapper options={optionsLightbox}>
                                        <View className="image-wrap">
                                            {
                                                !this._viewModel.journalItem.imageUrl.url ?
                                                    <View className="placeholder"></View>
                                                :
                                                    <Image
                                                        src={this._viewModel.journalItem.imageUrl.url}
                                                    />
                                            }
                                        </View>
                                    </SRLWrapper>
                            )
                        :
                            ( isPrivate ? (
                                <View className="hidden-transcription">
                                    <Image src={ProjectImages.lockJournalInner} alt="lock" />
                                    <Text className="label-btn2">transcription hidden</Text>
                                </View>
                            ) : (
                                <View className="view-transcription"
                                    onClick={goToTranscription}
                                >
                                    <Image src={ProjectImages.transcriptionIcon} alt="comment window with pencil" />
                                    <Text className="label-btn2">view a transcription</Text>
                                </View>
                            ))
                    }
                </Container>
                <View className="white-part">
                    <Container className="content">
                        <BubbleChartWrapper
                            clientName={clientFirstName}
                            filterModel={filter}
                        >
                            { sortedWords && sortedWords.length && sortedWords.length > 0
                                ? (
                                <BubbleChart
                                    data={sortedWords}
                                    height={500}
                                />
                                ) : (
                                    <Image alt="No bubbles there. Yet." src={ProjectImages.bubblePlaceholder} className="image-placeholder" />
                                )
                            }
                        </BubbleChartWrapper>
                    </Container>
                </View>
            </SimpleReactLightbox>
        );
    }

    render() {
        const content = this.renderContent();
        const loading = !content || this._viewModel.inProgress;

        return (
            <Page inProgress={loading} onKeyPress={this._onKeyPress} className="client-overview-page journal-inner inner-page">
                {content}
            </Page>
        );
    }
}
