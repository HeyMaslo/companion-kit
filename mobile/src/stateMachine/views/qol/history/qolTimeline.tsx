import { observer } from 'mobx-react';
import { observable } from 'mobx';
import React from 'react';
import { StyleSheet, Text, View, LayoutChangeEvent, FlatList, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { Button, Container, MasloPage } from 'src/components';
import TextStyles, { mainFontMedium } from 'src/styles/TextStyles';
import AppViewModel from 'src/viewModels';
import { ScenarioTriggers } from '../../../abstractions';
import { ViewState } from '../../base';
import { formatDateMonthYear } from 'common/utils/dateHelpers';
import Layout from 'src/constants/Layout';
import { getPersonaRadius } from '../../../persona';
import IconsOnCircle from '../../IconsOnCircle';
import { DomainName } from 'src/constants/Domain';
import { SurveyResults } from 'common/database/repositories/SurveyResultsRepo';
import SplineThroughPoints, { cartesianCoordinate } from '../../SplineThroughPoints';
import { QolSurveyType } from 'src/constants/QoL';
import Colors from '../../../../constants/colors/Colors';
import Images from 'src/constants/images';
import { containerStyles } from 'src/components/Container';

const containerMarginBottom = Layout.isSmallDevice ? 0 : 25;
const containerMarginTop = Layout.isSmallDevice ? 25 : 75;

const weekCircleDiameter = 50;
const weekCircleRadius = weekCircleDiameter / 2;
const weekCircleMarginLeft = ((Layout.window.width - containerStyles.container.paddingLeft - containerStyles.container.paddingRight) - 4 * weekCircleDiameter) / 8;

type QolTimelineViewState = {
  bottomWrapperTop: number,
  headerHeight: number,
}

@observer
export class QolTimelineView extends ViewState<QolTimelineViewState> {

  private selectedDomains: DomainName[] = [];
  private allDomains: string[] = [];
  private domainSort: DomainName = null;
  private ordRadius = getPersonaRadius();
  @observable
  private historyEntries: SurveyResults[] = [];
  @observable
  private entryCoordinates: cartesianCoordinate[] = [];
  @observable
  private graphHeight = 10;
  @observable
  private selectedEntry: SurveyResults;
  @observable
  private selectedEntryIndex = 0
  @observable
  private dropDownIsExtended = false;

  constructor(props) {
    super(props);
    this.onLayoutIconCircle = this.onLayoutIconCircle.bind(this);
    this.onLayoutGraphList = this.onLayoutGraphList.bind(this);
    this._contentHeight = this.layout.window.height - containerMarginTop;

    this.historyEntries = this.viewModel.historyEntries;
    this.selectedEntry = this.viewModel.selectedEntry;
    this.state = {
      bottomWrapperTop: 0,
      headerHeight: 0,
    }
  }

  private get viewModel() {
    return AppViewModel.Instance.QoLHistory;
  }

  async start() {
    this.historyEntries = this.viewModel.historyEntries;
    this.selectedEntryIndex = Math.max(0, this.historyEntries.map((entry) => entry.startDate).indexOf(this.selectedEntry.startDate)); // using startDate here as indexOf() is not working when comparing the whole object. startDate will be unique
    console.log('this.selectedEntryIndex', this.selectedEntryIndex)
    this.selectedDomains = AppViewModel.Instance.ChooseDomain.selectedDomains.map((d) => d.name);
    this.allDomains = AppViewModel.Instance.ChooseDomain.availableDomains.map((d) => d.name);
    this.allDomains.unshift('Show All');
  }

  onClose = () => {
    this.trigger(ScenarioTriggers.Cancel)
  }

  onViewStrategies = () => {
    this.trigger(ScenarioTriggers.Secondary)
  }

  onLayoutIconCircle(event: LayoutChangeEvent) {
    const { layout } = event.nativeEvent;
    this.persona.setupContainerHeight(0, null, (containerMarginTop - containerMarginBottom) + layout.height / 2);

    const bottomWrapperMarginTop = 20;
    this.setState({
      bottomWrapperTop: layout.height + bottomWrapperMarginTop,
    })
  }

  onLayoutGraphList(event: LayoutChangeEvent) {
    const { layout } = event.nativeEvent;
    this.graphHeight = layout.height;
    this.entryCoordinates = this.historyEntries.map((entry, index) => [index * (weekCircleDiameter + weekCircleMarginLeft * 2), this.topForWeekCircle(Math.round(entry.aggregateScore)) + weekCircleRadius]);
  }

  private topForWeekCircle(score: number): number {
    let res = score;
    if (score == null || Number.isNaN(score)) {
      res = 7;
    }
    return (this.graphHeight - weekCircleDiameter) * (1 - res / 20)
  }

  changeFilterPressed = (selection: string) => {
    if (selection == 'Show All') {
      this.domainSort = null;
    } else {
      this.domainSort = selection as DomainName;
    }

    this.dropDown();
  }

  dropDown = () => {
    this.dropDownIsExtended = !this.dropDownIsExtended;
  }

  renderDropDownListItem = ({ item }) => (
    <TouchableOpacity onPress={() => this.changeFilterPressed(item)}>
      <View style={styles.dropDownlistItem}>
        <Text style={[TextStyles.btnTitle, { display: 'flex', color: Colors.button.buttonForm.text }]}>{item}</Text>
      </View>
    </TouchableOpacity>
  );

  private renderListItem(item: SurveyResults, index: number): JSX.Element {
    let aggScore = item.aggregateScore;
    if (aggScore == null || Number.isNaN(aggScore)) {
      aggScore = 7;
    }
    return (
      <Pressable onPress={() => {
        this.selectedEntry = item
        this.selectedEntryIndex = index
      }}>
        <View style={[styles.weekCircle,
        item.surveyType == QolSurveyType.Full ? { borderWidth: styles.weekCircle.borderWidth * 2.2 } : { borderWidth: styles.weekCircle.borderWidth },
        index == this.selectedEntryIndex ? { backgroundColor: TextStyles.labelMedium.color } : { backgroundColor: 'white' },
        { top: this.topForWeekCircle(Math.round(aggScore)), left: 0, marginHorizontal: ((Layout.window.width - 40) - 4 * weekCircleDiameter) / 8 }]}>
          <Text style={[styles.weekCircleText, index == this.selectedEntryIndex ? { color: 'white' } : { color: TextStyles.labelMedium.color },]}>W{index + 1}</Text>
        </View>
      </Pressable>
    );
  }

  renderContent() {
    return (
      <MasloPage style={this.baseStyles.page} onClose={() => this.onClose()}>
        <Container style={[{ height: this._contentHeight, marginTop: containerMarginTop, marginBottom: containerMarginBottom }]}>
          <IconsOnCircle circleRaius={this.ordRadius * 6} symbolSize={40} highlightedDomains={this.selectedDomains} onLayout={this.onLayoutIconCircle} />
          <View pointerEvents={'box-none'} style={[styles.bottomWrapper, { top: this.state.bottomWrapperTop }]}>

            <View style={styles.header} onLayout={(event) => this.setState({ headerHeight: event.nativeEvent.layout.height })}>
              <Text style={[TextStyles.labelLarge]}>{formatDateMonthYear(this.selectedEntry.date)}</Text>
              <View style={styles.header}>

                <TouchableOpacity onPress={this.dropDown} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[TextStyles.labelLarge, this.domainSort && { textDecorationLine: 'underline' }]}>{this.domainSort || `Quality of\nlife score`}</Text>
                  <Images.caretDown width={14} height={8} color={TextStyles.labelLarge.color} style={[{ marginLeft: 7 }, this.dropDownIsExtended && { transform: [{ rotate: '180deg' }] }]} />
                </TouchableOpacity>

                <View style={styles.scoreCircle}>
                  <Text style={[TextStyles.labelLarge, styles.scoreCircleText]}>{Math.round(this.selectedEntry.aggregateScore)}</Text>
                </View>
              </View>
            </View>

            {/* Horizontaly Scrolling Graph */}
            <ScrollView style={styles.list}
              horizontal={true}
              onLayout={this.onLayoutGraphList}>

              <SplineThroughPoints style={[styles.curve, { width: this.historyEntries.length * (weekCircleDiameter + weekCircleMarginLeft * 2), height: this.graphHeight }]}
                viewBox={`0 0 ${this.historyEntries.length * (weekCircleDiameter + weekCircleMarginLeft * 2)} ${this.graphHeight}`}
                controlPoints={this.entryCoordinates}
                strokeColor={TextStyles.labelMedium.color}
                strokeWidth={4} />
              {this.historyEntries.map((entry, index) => this.renderListItem(entry, index))}

            </ScrollView>

            <Button
              title={`View Week ${this.selectedEntryIndex + 1} Strategies`}
              style={[styles.viewAllButton]}
              onPress={this.onViewStrategies}
              isTransparent={true}
              disabled={this.dropDownIsExtended} />

            {/* Dropdown list is here so it renders on top of everything */}
            {this.dropDownIsExtended &&
              <FlatList style={[styles.dropDownlist, { marginTop: this.state.headerHeight }]}
                data={this.allDomains}
                renderItem={this.renderDropDownListItem}
                keyExtractor={item => item} />}
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
  scoreCircle: {
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
  scoreCircleText: {
    marginLeft: TextStyles.labelLarge.letterSpacing * 2,
    marginTop: TextStyles.labelLarge.lineHeight / 6
  },
  list: {
    height: '55%',
    marginBottom: '5%',
  },
  weekCircle: {
    width: weekCircleDiameter,
    height: weekCircleDiameter,
    borderRadius: weekCircleRadius,
    borderColor: TextStyles.labelMedium.color,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  weekCircleText: {
    fontFamily: mainFontMedium,
    fontWeight: '500',
    fontSize: 15,
  },
  curve: {
    position: 'absolute',
    left: weekCircleMarginLeft + weekCircleRadius,
  },
  dropDownlist: {
    position: 'absolute',
    top: '5%',
    right: 40 + 15, // scoreCircle.width + scoreCircle.paddingLeft
    height: '65%',
    display: 'flex',
    flexGrow: 0,
    borderWidth: 1,
    borderRadius: 7,
    borderColor: '#CBC8CD',
    backgroundColor: 'white',
  },
  dropDownlistItem: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
  },
});
