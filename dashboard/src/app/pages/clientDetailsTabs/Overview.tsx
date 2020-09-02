import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, Tooltip, Image } from 'app/common/components';
import { OverviewViewModel } from 'app/viewModels/OverviewViewModel';
import ButtonArrow from 'app/components/ButtonArrow';
import InfographicCard from 'app/components/InfographicCard';
import MarkdownView from 'app/components/MarkdownView';
import WebClientTracker, { Events } from 'app/services/webTracker';
import InsightsCard from 'app/components/InsightsCard';
import Placeholder from 'app/components/PlaceHolder';
import Select from 'app/common/components/Select';
import { PersonaComponentLoader } from 'app/components/persona/loader';
import Localization from 'app/services/localization';
import HighlightCard from './HighlightCard';
import BubbleChart from 'app/components/BubbleChart';
import BubbleChartWrapper from 'app/components/BubbleChartWrapper';
import ProjectImages from 'app/helpers/images';

// import JournalList from './JournalList';
import logger from 'common/logger';

// import ResilienceMeter from 'app/components/ResilienceMeter';
// import MentalAnimation from 'assets/lottie/mental_health.json';
// import MindAnimation from 'assets/lottie/mindfullness.json';
// import EnergyAnimation from 'assets/lottie/energy.json';

// const mentalTooltipMessage = 'A mirror of the users ability to enjoy life and to create a balance between life activities and efforts. It is measured by the change in sentiment of content, amount of new information added, and complexity of vocabulary.';
// const mindfulnessTooltipMessage = 'A mirror of the users ability to have receptive awareness of and attention to what is taking place in the present. It is measured by the user talking about things in the immediate physical vicinity, frequency of journal use, and self-reported mood.';
// const energyTooltipMessage = 'A mirror of the users physiological and mental level. It is measured by the change in speed, frequency, and volume.';

const CheckInHighlightsTooptipMessage = `Over the past 14 days or 30 days, ${Localization.Current.DashboardProject.userName.singular} wants to review a self-reported check-in that is `
    + 'very good or very bad.';

type OverviewProps = {
    model: OverviewViewModel;
};

function getPlaceholder(title?: string, desc?: string) {
    return (
        <Placeholder
            title={title ? title : 'Not enough data'}
            description={desc ? desc : 'I need some check-ins to tell you something.'}
            visual={ProjectImages.emptyDataGradientChart}
            className={'overview-placeholder'}
        />
    );
}

@observer
class Overview extends React.Component<OverviewProps> {
    get model() { return this.props.model; }

    componentDidMount() {
        WebClientTracker.Instance?.trackEvent(Events.Overview(this.model.clientName));
    }

    render() {
        const {
            infographics,
            coachName,
            insights,
            onFeedBack,
            Highlights,
            dateSelect,
            client,
            wordsFilter: filter,
            filteredWords: sortedWords,
            personaMessage,
        } = this.model;

        return (
            <View className="overview-tab">
                <View className="welcome-wrap">
                    <View className="left-block">
                        <View className="maslo-wrap">
                            <PersonaComponentLoader />
                        </View>
                        <View className="text-block">
                            <Text className="title-h2 type5">{personaMessage.greeting}</Text>
                            <Text className="desc-3 type4">{personaMessage.message}</Text>
                        </View>
                    </View>
                    {/* <View className="right-block">
                        <ButtonArrow
                            typeButton="primary"
                            title="Take a tour"
                            titleClassName="type4"
                            onClick={() => logger.log()}
                        />
                    </View> */}
                </View>

                <View className="infographics-wrap">
                    <View className="title-wrap">
                        <Text className="title-h2 type5 notice-list-title">How’s the client?</Text>
                        <Select
                            model={dateSelect}
                            className="date-status white-bg"
                            buttonClassname="label-dropdown3"
                            itemClassname="label-dropdown3"
                        />
                    </View>
                    <View className="infographics-list">
                        {infographics.map((item, i) => <InfographicCard
                            key={i}
                            model={item}
                        />)}
                    </View>
                </View>
                { insights && insights.length ? (
                    <View className="notice-list">
                        <Text className="title-h2 type5 notice-list-title">Hey <em>{coachName}</em>
                            , here’s what I noticed:
                        </Text>
                        <ul className={'desc-3'}>
                            {insights.map(( el, i ) =>
                                (<li key={i}>
                                    <InsightsCard onFeedback={(val) => onFeedBack(i, val)}>
                                        <MarkdownView content={el} options={{ forceBlock: false }} />
                                    </InsightsCard>
                                </li>),
                            )}
                        </ul>
                    </View>
                ) : null}

                <View className="highlights-title">
                    <Text className="title-h2 type5 notice-list-title">Check-in Highlights</Text>
                    <Tooltip
                        className="highlights large"
                        direction="bottom-center"
                        title="Check-in Highlights"
                        message={CheckInHighlightsTooptipMessage}
                    />
                    {/* <Select
                        model={dateSelect}
                        className="dropdown-filter"
                        buttonClassname="desc-6"
                    /> */}
                </View>
                <View className="highlights-list">
                    {Highlights.list?.length > 0
                        ? Highlights.list.map(cardViewModel => {
                            const jid = cardViewModel.id;

                            return (
                                <HighlightCard
                                    key={jid}
                                    model={cardViewModel}
                                    active={Highlights.activeId === jid}
                                    clientId={Highlights.clientId}
                                />
                            );
                        })
                        : getPlaceholder()
                    }
                </View>
                <BubbleChartWrapper
                    clientName={client.firstName}
                    filterModel={filter}
                >
                    {sortedWords.length && sortedWords.length > 0
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
            </View>
        );
    }
}

export default Overview;
