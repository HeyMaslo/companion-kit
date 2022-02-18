import { observer } from 'mobx-react';
import { observable } from 'mobx';
import React from 'react';
import { StyleSheet, Text, View, LayoutChangeEvent, FlatList, TouchableOpacity, ScrollView, Pressable, PointPropType } from 'react-native';
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
import SplineThroughPoints, { CartesianCoordinate } from '../../SplineThroughPoints';
import { QolSurveyType } from 'src/constants/QoL';
import Colors from '../../../../constants/colors/Colors';
import Images from 'src/constants/images';
import { containerStyles } from 'src/components/Container';
import { sum } from 'src/helpers/DomainHelper';

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

  private allDomains: string[] = [];
  private domainSort: DomainName = null;
  @observable
  private dropDownIsExtended = false;
  @observable
  private historyEntries: SurveyResults[] = [];
  @observable
  private entryCoordinates: CartesianCoordinate[] = [];
  @observable
  private graphHeight = 10;
  @observable
  private selectedEntry: SurveyResults;
  private selectedEntryIndex = 0
  @observable
  private selectedDomains: DomainName[] = [];
  private ordRadius = getPersonaRadius();
  private scrollViewContentOffset: PointPropType = { x: 0, y: 0 };

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

  // MK-TODO: - colors and theme, wait until design is finalized

  async start() {
    this.historyEntries = this.viewModel.historyEntries;
    this.selectedEntry = this.viewModel.selectedEntry;
    this.selectedEntryIndex = this.viewModel.selectedEntryWeekNumber - 1;
    this.selectedDomains = this.selectedEntry.focusDomains.domains || [];
    this.scrollViewContentOffset = { x: this.selectedEntryIndex * (weekCircleDiameter + weekCircleMarginLeft * 2), y: 0 };

    this.allDomains = AppViewModel.Instance.Domain.allDomains.map((d) => d.name);
    this.allDomains.unshift('Show All');
  }

  onBack = () => {
    this.trigger(ScenarioTriggers.Back)
  }

  onClose = () => {
    this.trigger(ScenarioTriggers.Cancel)
  }

  onViewStrategies = () => {
    AppViewModel.Instance.Strategy.temporaryDisplay = AppViewModel.Instance.Strategy.allStrategies.filter((strat) => this.selectedEntry.strategyIds.includes(strat.internalId));
    this.viewModel.setSelectedEntry(this.selectedEntry, this.selectedEntryIndex + 1);
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
    this.generateEntryCoordinates();
  }

  private generateEntryCoordinates() {
    if (this.domainSort == null) {
      this.entryCoordinates = this.historyEntries.map((entry, index) => [index * (weekCircleDiameter + weekCircleMarginLeft * 2), this.topForWeekCircle(Math.round(entry.aggregateScore)) + weekCircleRadius]);
    } else {
      this.entryCoordinates = this.historyEntries.map((entry, index) => [index * (weekCircleDiameter + weekCircleMarginLeft * 2), this.topForWeekCircle(Math.round(sum(entry.results[this.domainSort]))) + weekCircleRadius]);
    }
  }

  private topForWeekCircle(score: number): number {
    return (this.graphHeight - weekCircleDiameter) * (1 - score / 20)
  }

  changeFilterPressed = (selection: string) => {
    if (selection == 'Show All') {
      this.domainSort = null;
      this.selectedDomains = this.selectedEntry.focusDomains.domains;
    } else {
      this.domainSort = selection as DomainName;
      this.selectedDomains = [this.domainSort];
    }
    this.generateEntryCoordinates();
    this.dropDown();
  }

  dropDown = () => {
    this.dropDownIsExtended = !this.dropDownIsExtended;
  }

  private scoreToDisplay(sort: DomainName): number {
    if (sort == null) {
      return Math.round(this.selectedEntry.aggregateScore);
    }
    let totalScore = 0;
    this.selectedEntry.results[sort].forEach((score) => {
      totalScore += score;
    })
    return totalScore;
  }

  renderDropDownListItem = ({ item }) => (
    <TouchableOpacity onPress={() => this.changeFilterPressed(item)}>
      <View style={styles.dropDownlistItem}>
        <Text style={[TextStyles.btnTitle, { display: 'flex', color: Colors.button.buttonForm.text }]}>{item}</Text>
      </View>
    </TouchableOpacity>
  );

  private renderListItem(item: SurveyResults, index: number): JSX.Element {
    let score = 0;
    if (this.domainSort == null) {
      score = item.aggregateScore;
    } else {
      score = sum(item.results[this.domainSort]);
    }
    if (score == null || Number.isNaN(score)) {
      score = 7;
    }
    return (
      <Pressable key={`${item.date}`} onPress={() => {
        this.selectedEntry = item
        this.selectedEntryIndex = index
        if (this.domainSort == null) {
          this.selectedDomains = this.selectedEntry.focusDomains.domains || [];
        }
      }}>
        <View style={[styles.weekCircle,
        item.surveyType == QolSurveyType.Full ? { borderWidth: styles.weekCircle.borderWidth * 2.2 } : { borderWidth: styles.weekCircle.borderWidth },
        index == this.selectedEntryIndex ? { backgroundColor: this.theme.colors.highlightSecondary } : { backgroundColor: 'white' },
        { top: this.topForWeekCircle(Math.round(score)), left: 0, marginHorizontal: ((Layout.window.width - 40) - 4 * weekCircleDiameter) / 8 }]}>
          <Text style={[styles.weekCircleText, index == this.selectedEntryIndex ? { color: 'white' } : { color: this.theme.colors.highlightSecondary }]}>{index == 0 ? 'ST' : 'W' + index}</Text>
        </View>
      </Pressable>
    );
  }

  renderContent() {
    return (
      <MasloPage style={this.baseStyles.page} onBack={() => this.onBack()} onClose={() => this.onClose()} theme={this.theme}>
        <Container style={[{ height: this._contentHeight, marginTop: containerMarginTop, marginBottom: containerMarginBottom }]}>
          <IconsOnCircle circleRaius={this.ordRadius * 6} symbolSize={40} totalContainerMargin={containerMarginTop - containerMarginBottom} highlightedDomains={this.selectedDomains} onLayout={this.onLayoutIconCircle} />
          <View pointerEvents={'box-none'} style={[styles.bottomWrapper, { top: this.state.bottomWrapperTop }]}>

            <View style={styles.header} onLayout={(event) => this.setState({ headerHeight: event.nativeEvent.layout.height })}>
              <Text style={[TextStyles.labelLarge]}>{this.selectedEntry.date && formatDateMonthYear(this.selectedEntry.date)}</Text>
              <View style={styles.header}>

                <TouchableOpacity onPress={this.dropDown} style={{ flexDirection: 'row', alignItems: 'center' }} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <Text style={[TextStyles.labelLarge, this.domainSort && { textDecorationLine: 'underline' }]}>{this.domainSort || `Quality of\nlife score`}</Text>
                  <Images.caretDown width={14} height={8} color={this.theme.colors.foreground} style={[{ marginLeft: 7 }, this.dropDownIsExtended && { transform: [{ rotate: '180deg' }] }]} />
                </TouchableOpacity>

                <View style={styles.scoreCircle}>
                  <Text style={[TextStyles.labelLarge, styles.scoreCircleText]}>{this.scoreToDisplay(this.domainSort)}</Text>
                </View>
              </View>
            </View>

            {/* Horizontaly Scrolling Graph */}
            <ScrollView style={styles.list}
              horizontal={true}
              onLayout={this.onLayoutGraphList}
              contentOffset={this.scrollViewContentOffset}>

              <SplineThroughPoints style={[styles.curve, { width: this.historyEntries.length * (weekCircleDiameter + weekCircleMarginLeft * 2), height: this.graphHeight }]}
                viewBox={`0 0 ${this.historyEntries.length * (weekCircleDiameter + weekCircleMarginLeft * 2)} ${this.graphHeight}`}
                controlPoints={this.entryCoordinates}
                strokeColor={this.theme.colors.highlightSecondary}
                strokeWidth={4} />

              {this.historyEntries.map((entry, index) => this.renderListItem(entry, index))}

            </ScrollView>
            {this.selectedEntryIndex !== 0 &&
            <Button
              title={`View Week ${this.selectedEntryIndex} Strategies`}
              style={[styles.viewAllButton]}
              onPress={this.onViewStrategies}
              isTransparent={true}
              disabled={this.dropDownIsExtended}
              theme={this.theme} />}

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
    // borderColor: TextStyles.labelLarge.color,
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
    // borderColor: TextStyles.labelLarge.color,
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
    // borderColor: TextStyles.labelMedium.color,
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
