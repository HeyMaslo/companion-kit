import { observer } from 'mobx-react';
import { observable } from 'mobx';
import React from 'react';
import { StyleSheet, Text, View, LayoutChangeEvent, FlatList } from 'react-native';
import { Button, Container, MasloPage, StrategyCard } from 'src/components';
import TextStyles from 'src/styles/TextStyles';
import AppViewModel from 'src/viewModels';
import { ScenarioTriggers } from '../../../abstractions';
import { ViewState } from '../../base';
import { formatDateMonthYear, months } from 'common/utils/dateHelpers';
import Layout from 'src/constants/Layout';
import { getPersonaRadius, PersonaScale } from '../../../persona';
import IconsOnCircle from '../../IconsOnCircle';
import { DomainName } from 'src/constants/Domain';
import { SurveyResults } from 'common/database/repositories/SurveyResultsRepo';
import CubicBezierCurve from '../../CubicBezierCurve';
import { getUniqueID } from 'react-native-markdown-renderer';
import { QolSurveyType } from 'src/constants/QoL';

const date = new Date();
const today = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

const containerMarginBottom = Layout.isSmallDevice ? 0 : 25;
const containerMarginTop = Layout.isSmallDevice ? 25 : 75;

const scoreCircleDiameter = 50;
const scoreCircleRadius = scoreCircleDiameter / 2;

type QolTimelineViewState = {
  bottomWrapperTop: number,
  graphHeight: number,
  graphWidth: number,
}

@observer
export class QolTimelineView extends ViewState<QolTimelineViewState> {

  private selectedDomains: DomainName[] = [];
  private ordRadius = getPersonaRadius();
  @observable
  private historyEntries: SurveyResults[];
  @observable
  private selectedEntry: SurveyResults;

    constructor(props) {
        super(props);
        this.onLayoutIconCircle = this.onLayoutIconCircle.bind(this);
        this.onLayoutGraphList = this.onLayoutGraphList.bind(this);
        this._contentHeight = this.layout.window.height - containerMarginTop;
        this.selectedDomains = AppViewModel.Instance.ChooseDomain.selectedDomains.map((d) => d.name);
        this.historyEntries = this.viewModel.historyEntries;
        this.selectedEntry = this.viewModel.selectedEntry;
        this.state = {
          bottomWrapperTop: 0,
          graphHeight: 0,
          graphWidth: 0,
        }
    }

    private get viewModel() {
      return AppViewModel.Instance.QoLHistory;
    }

    async start() {
      this.historyEntries = this.viewModel.historyEntries;
      this.selectedEntry = this.viewModel.selectedEntry;
    }

    onClose = () => {
      this.trigger(ScenarioTriggers.Cancel)
    }

    onViewStrategies = () => {
      this.trigger(ScenarioTriggers.Secondary)
    }

    onLayoutIconCircle(event: LayoutChangeEvent) {
      const { layout } = event.nativeEvent;
      this.persona.setupContainerHeight(0, null, (containerMarginTop - containerMarginBottom) + layout.height/2);

      const bottomWrapperMarginTop = 20;
      this.setState({
        bottomWrapperTop: layout.height + bottomWrapperMarginTop,
      })
    }

    onLayoutGraphList(event: LayoutChangeEvent) {
      const { layout } = event.nativeEvent;
      this.setState({
        graphHeight: layout.height,
        graphWidth: layout.width - 4 * scoreCircleDiameter,
      })
    }

    private topForScoreCircle(score: number): number {
      return (this.state.graphHeight - scoreCircleDiameter) * (1 - score / 20)
    }

    renderListItem = ({ item }) => (
      <View style={[styles.scoreCircle,
                    item.surveyType == QolSurveyType.Full ? {borderWidth: styles.scoreCircle.borderWidth * 2.2} : {borderWidth: styles.scoreCircle.borderWidth},
                    {top: this.topForScoreCircle(item.aggregateScore), marginHorizontal: this.state.graphWidth / 8}]}>
        <Text>{item.aggregateScore}</Text>
      </View>
    );

    renderContent() {
        return (
            <MasloPage style={this.baseStyles.page} onClose={() => this.onClose()}>
                <Container style={[{height: this._contentHeight, marginTop: containerMarginTop, marginBottom: containerMarginBottom}]}>
                    <IconsOnCircle circleRaius={this.ordRadius * 6} symbolSize={40} highlightedDomains={this.selectedDomains} onLayout={this.onLayoutIconCircle}/>
                    <View pointerEvents={'box-none'} style={[styles.bottomWrapper, {top: this.state.bottomWrapperTop}]}>

                    <View style={styles.header}>
                      <Text style={[TextStyles.labelLarge]}>{formatDateMonthYear(this.selectedEntry.date)}</Text>
                      <View style={styles.header}>
                        <Text style={[TextStyles.labelLarge]}>Quality of{'\n'}life score</Text>
                        <View style={styles.smallCircle}>
                          <Text style={[TextStyles.labelLarge, styles.smallCircleText]}>14</Text>
                        </View>
                      </View>
                    </View>

                    <FlatList style={styles.list}
                              horizontal={true}
                              contentOffset={{ x: 1200, y: 0 }} // MK-TODO calculate this offste based on week #
                              data={this.historyEntries}
                              renderItem={this.renderListItem}
                              keyExtractor={item => getUniqueID()}
                              onLayout={this.onLayoutGraphList}/>

                  {/* Score Graph */}
                    {/* <View style={styles.graph} onLayout={this.onLayoutGraph}>
                      <View style={[styles.scoreCircle, {top: firstWeekTop}]}><Text>{monthResults.firstWeek}</Text></View>
                      <CubicBezierCurve style={[styles.curve, {height: this.state.graphHeight, width: curveWidth, left: scoreCircleRadius,}]} 
                                        viewBox={`0 0 ${curveWidth} ${this.state.graphHeight}`} 
                                        startPoint={[0, this.state.graphHeight - scoreCircleRadius]} 
                                        controlPointFirst={[curveWidth / 3, this.state.graphHeight - scoreCircleRadius]} 
                                        controlPointSecond={[curveWidth * 2/3, secondWeekTop + scoreCircleRadius]} 
                                        endPoint={[curveWidth, secondWeekTop + scoreCircleRadius]} 
                                        strokeColor={TextStyles.labelMedium.color}/>

                      <View style={[styles.scoreCircle, {top: secondWeekTop}]}><Text>{monthResults.secondWeek}</Text></View>
                      <CubicBezierCurve style={[styles.curve, {height: this.state.graphHeight, width: curveWidth, left: scoreCircleRadius + curveWidth}]} 
                                        viewBox={`0 0 ${curveWidth} ${this.state.graphHeight}`} 
                                        startPoint={[0, secondWeekTop + scoreCircleRadius]} 
                                        controlPointFirst={[curveWidth / 3, secondWeekTop + scoreCircleRadius]} 
                                        controlPointSecond={[curveWidth * 2/3, thirdWeekTop + scoreCircleRadius]} 
                                        endPoint={[curveWidth, thirdWeekTop + scoreCircleRadius]} 
                                        strokeColor={TextStyles.labelMedium.color}/>

                      <View style={[styles.scoreCircle, {top: thirdWeekTop}]}><Text>{monthResults.thirdWeek}</Text></View>
                      <CubicBezierCurve style={[styles.curve, {height: this.state.graphHeight, width: curveWidth, left: scoreCircleRadius + this.state.graphWidth * 2/3}]} 
                                        viewBox={`0 0 ${curveWidth} ${this.state.graphHeight}`} 
                                        startPoint={[0, thirdWeekTop + scoreCircleRadius]} 
                                        controlPointFirst={[curveWidth / 3, thirdWeekTop + scoreCircleRadius]}
                                        controlPointSecond={[curveWidth * 2/3, fourthWeekTop + scoreCircleRadius]}
                                        endPoint={[curveWidth, fourthWeekTop + scoreCircleRadius]} 
                                        strokeColor={TextStyles.labelMedium.color}/>

                      <View style={[styles.scoreCircle, {top: fourthWeekTop}]}><Text>{monthResults.fourthWeek}</Text></View>
                    </View> */}

                      <Button
                          title={`View Week ${'_x_'} Strategies`}
                          style={[styles.viewAllButton]}
                          onPress={this.onViewStrategies}
                          isTransparent={true}
                      />
                    </View>
                </Container>
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({ 
bottomWrapper: {
  position: 'absolute',
  left: 20,
  right: 20,
  bottom: 0,
},
viewAllButton: {
  alignSelf: 'center',
  width: '70%',
  height: 50,
  margin: 5,
  borderWidth: 1,
  borderColor: TextStyles.labelLarge.color,
},
header: {
  marginVertical: '5%',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
smallCircle: {
  marginLeft: 15,
  width: 40,
  height: 40,
  borderRadius: 40 / 2,
  backgroundColor: 'transparent',
  borderColor: TextStyles.labelLarge.color,
  borderWidth: 2,
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
},
smallCircleText: {
  marginLeft: TextStyles.labelLarge.letterSpacing * 2,
  marginTop: TextStyles.labelLarge.lineHeight / 6
},
list: {
  height: '55%',
  marginBottom: '5%',
  backgroundColor: 'green',
},
graph: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  height: '55%',
  marginBottom: '5%',
},
scoreCircle: {
  width: scoreCircleDiameter,
  height: scoreCircleDiameter,
  borderRadius: scoreCircleRadius,
  borderColor: TextStyles.labelMedium.color,
  borderWidth: 2,
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  zIndex: 999,
},
curve: {
  position: 'absolute',
  top: 0, 
}
});
