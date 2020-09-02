import React from 'react';
import { observer } from 'mobx-react';
import { AssessmentType } from 'common/models';
import { RouteComponentProps } from 'react-router';
import History from 'app/services/history';
import * as Routes from 'app/constants/routes';
import Select from 'app/common/components/Select';
import { ClientDetailsViewModel } from 'app/viewModels/ClientDetailsViewModel';
import { Container, View, Text, Page, Image, Tooltip, Button } from 'app/common/components';
import GradientChart from 'app/components/GradientChart';
import Tabs from 'app/components/Tabs';
import ProfileViewModel from 'app/viewModels/ProfileViewModel';
import Overview from 'app/pages/clientDetailsTabs/Overview';
import Journal from 'app/pages/clientDetailsTabs/Journal';
import Sessions from 'app/pages/clientDetailsTabs/Sessions';
import Assessments from 'app/pages/clientDetailsTabs/Assessments';
import Goals from 'app/pages/clientDetailsTabs/Goals';
import Docs from 'app/pages/clientDetailsTabs/Docs';
import { noData } from 'app/mocks/gradientChart';
import ProjectImages from 'app/helpers/images';
import Localization from 'app/services/localization';
import TimeTracking from 'app/pages/clientDetailsTabs/TimeTracking';
import { createLazy } from 'common/utils/lazy.light';

import Report from 'app/pages/clientDetailsTabs/Report';

// tslint:disable-next-line: max-line-length
const mainTooltipMessage = 'An overview of the sentiment your client check-ins. Sentiment is a view of or attitude toward a situation or event. Data is based on the entries of that specific day.';

type Props = {
    clientId: string;
    tab: Routes.ClientDetails.Tabs;
    isBlack?: boolean;
};

export function ClientDetailsWithTabs(props: RouteComponentProps<{ clientId: string, tab: string }>) {
    const tabValue = Routes.ClientDetails.Tabs.fromKey(props.match.params.tab);
    const clientId = props.match.params.clientId;
    // console.log('ClientDetailsWithTabs', props.match.params.tab, props.match.params.clientId);
    return (
        <ClientDetails clientId={clientId} tab={tabValue} />
    );
}

const TabLinks = (function getTabLinks(this: void) {
    const links = [
        {
            title: 'overview',
            tab: Routes.ClientDetails.Tabs.overview,
        },
        {
            title: 'check-ins',
            tab: Routes.ClientDetails.Tabs.journal,
        },
    ];

    if (process.appFeatures.SESSIONS_DISABLED === false) {
        links.push({
            title: 'sessions',
            tab: Routes.ClientDetails.Tabs.sessions,
        });
    }

    if (process.appFeatures.ASSESSMENTS_ENABLED === true) {
        links.push({
            title: 'assessments',
            tab: Routes.ClientDetails.Tabs.assessments,
        });
    }

    if (process.appFeatures.GOALS_ENABLED === true) {
        links.push({
            title: 'Goals',
            tab: Routes.ClientDetails.Tabs.goals,
        });
    }

    if (process.appFeatures.COACH_TIME_TRACKING_ENABLED === true) {
        links.push({
            title: 'Time tracking',
            tab: Routes.ClientDetails.Tabs.timetracking,
        });
    }

    if (process.appFeatures.NOTES_ON_INDIVIDUALS === true) {
        links.push({
            title: 'Progress notes',
            tab: Routes.ClientDetails.Tabs.report,
        });
    }

    links.push({
        title: 'Docs',
        tab: Routes.ClientDetails.Tabs.docs,
    });

    return links;
})();

@observer
class ClientDetails extends React.Component<Props> {
    private readonly _viewModel = new ClientDetailsViewModel();

    private readonly _tabs = createLazy(() => {
        const tabs = [
            <Overview model={this._viewModel.overview} />,
            <Journal model={this._viewModel.journal} />,
        ];

        if (process.appFeatures.SESSIONS_DISABLED === false) {
            tabs.push(
                <Sessions model={this._viewModel.sessions} />,
            );
        }

        if (process.appFeatures.ASSESSMENTS_ENABLED === true) {
            tabs.push(
                <Assessments model={this._viewModel.assessment} />,
            );
        }

        if (process.appFeatures.GOALS_ENABLED === true) {
            tabs.push(
                <Goals model={this._viewModel.goals}/>,
            );
        }

        if (process.appFeatures.COACH_TIME_TRACKING_ENABLED === true) {
            tabs.push(
                <TimeTracking model={this._viewModel.timeTracking} />,
            );
        }

        if (process.appFeatures.NOTES_ON_INDIVIDUALS === true) {
            tabs.push(
                <Report formModel={this._viewModel.report} />,
            );
        }

        tabs.push(
            <Docs model={this._viewModel.docs} />,
        );

        return tabs;
    });

    private updateTab() {
        const tab = this.props.tab;
        const index = TabLinks.findIndex(tl => tl.tab === tab);
        this._viewModel.tabs.selectedIndex = index;
    }

    componentDidMount() {
        if (this.props.tab == null) {
            History.replace(Routes.ClientDetails(this.props.clientId, Routes.ClientDetails.Tabs.overview));
            return;
        }

        this.updateTab();
        this._viewModel.setClientId(this.props.clientId);
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.tab !== prevProps.tab) {
            this.updateTab();
        }
        if (this.props.clientId !== prevProps.clientId || this.props.tab !== prevProps.tab) {
            this._viewModel.setClientId(this.props.clientId);
        }
    }

    componentWillUnmount() {
        this._viewModel.dispose();
    }

    private _onBackArrowClick = () => {
        History.push(Routes.Clients);
    }

    get profile() { return ProfileViewModel.Instance; }

    goToInner = () => {
        const lastItem = this._viewModel.lastAssessmetCard && this._viewModel.lastAssessmetCard;

        if (lastItem) {
            const id = lastItem.id;
            const clientId = this.props.clientId;
            const type = lastItem.type;
            History.push(Routes.ClientDetails.IntakeFormInner(clientId, type, id));
        }
    }

    render() {
        const client = this._viewModel.client;
        const clientName = client.firstName && client.lastName ? `${client.firstName} ${client.lastName}` : '';
        const age = this._viewModel.clientAge !== null ? `, ${this._viewModel.clientAge}` : '';
        const lastCard = this._viewModel.lastAssessmetCard && this._viewModel.lastAssessmetCard;

        if (!client) {
            // TODO Loading?
            return null;
        }

        const { chart, dateSelect, chartTypeSelect, inProgress, selectedChartType } = this._viewModel;
        const chartData = chart && chart.length > 0;

        return (
            <Page className="client-overview-page" inProgress={inProgress}>
                <Container className="heading-container">
                    <View className="left-block">
                        <View onClick={this._onBackArrowClick} className="arrow-link">
                            <Image className="arrow-icon" src={ProjectImages.backArrow} />
                        </View>
                        <View className="text-content">
                            <View className="text-block">
                                <View className="client-title-wrap">
                                    {/* tslint:disable-next-line: max-line-length */}
                                    <Text className="title title-h1">{
                                        `${clientName}${age}${client.occupation ? `, ${client.occupation}` : '' }`
                                    }</Text>
                                    <View className="divider" />
                                    {/* <View className="edit-btn"
                                        onClick={() => History.push(Routes.ClientDetails(client.id, Routes.ClientDetails.Tabs.edit))}
                                    > */}
                                    <View className="edit-btn"
                                        onClick={() => History.push(Routes.ClientDetails(client.id, Routes.ClientDetails.Tabs.view))}
                                    >
                                        <Image className="edit-icon" src={ProjectImages.clientIcon} />
                                        <Text className="label-btn2 edit-btn-text">{Localization.Current.DashboardProject.clientName.singular.toLowerCase()} details</Text>
                                    </View>
                                </View>
                                <View className="bottom">
                                    <Select
                                        model={chartTypeSelect}
                                        className="chart-select"
                                        buttonClassname="label-dropdown2"
                                    />
                                    <Select
                                        model={dateSelect}
                                        className="date-status"
                                        buttonClassname="label-dropdown2"
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                    <View className="right-block">
                            {
                                lastCard &&
                                <View className={`phg9-card ${lastCard.type}`} onClick={this.goToInner}>
                                    <Text className={`label-client-item depres-severity ${lastCard.title.toLowerCase().replace(/ /g, '-')}`}>{lastCard.title}</Text>
                                    <Text className="phq9-inner-recommend-label date">{AssessmentType.getFullString[lastCard.type]}  &#183; {lastCard.date}</Text>
                                    {/* <Tooltip
                                        title="PHQ-9"
                                        direction="bottom-center"
                                        message={mainTooltipMessage}
                                        isWhite
                                    /> */}
                                </View>
                            }
                    </View>
                </Container>
                {!chart || chart.length === 0 ?
                    <View className="empty-data-message">
                        <Image className="empty-data-icon" src={ProjectImages.emptyDataGradientChart} />
                        <Text className="label-btn4 empty-data-text">
                            <Text className="label-btn4 type1">Your {Localization.Current.DashboardProject.clientName.singular.toLowerCase()} doesn’t have enough data to display.</Text>
                        </Text>
                    </View>
                :
                    <GradientChart
                        data={chartData ? chart : noData}
                        lineCoordsColor={chartData ? 'white' : 'none'}
                        startFrom={chartData ? null : 0.5}
                        finshAt={chartData ? null : 0.5}
                        className={chartData ? '' : 'no-data'}
                    />
                }
                <View className="scrollable">
                    <Container className="content">
                        <Tabs
                            model={this._viewModel.tabs}
                            links={
                                TabLinks.map(tl => {
                                    return {title: tl.title, route: Routes.ClientDetails(client.id, tl.tab) };
                                })
                            }
                            tabs={this._tabs.value}
                        />
                    </Container>
                </View>
            </Page>
        );
    }
}

export default ClientDetails;
