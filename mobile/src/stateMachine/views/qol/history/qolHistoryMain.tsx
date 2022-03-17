import { observer } from 'mobx-react';
import React from 'react';
import { FlatList, GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Container, MasloPage } from 'src/components';
import TextStyles from 'src/styles/TextStyles';
import AppViewModel from 'src/viewModels';
import Colors from '../../../../constants/colors/Colors';
import { ScenarioTriggers } from '../../../abstractions';
import { ViewState } from '../../base';
import { iconForDomain } from 'src/helpers/DomainHelper';
import { DomainSlug } from 'src/constants/Domain';
import { SurveyResults } from 'common/database/repositories/SurveyResultsRepo';
import { formatDateMonthYear } from 'common/utils/dateHelpers';
import { observable } from 'mobx';

@observer
export class QolHistoryMainView extends ViewState {

  @observable
  private historyEntries: SurveyResults[];

  constructor(props) {
    super(props);
    this._contentHeight = this.persona.setupContainerHeightForceScroll({ rotation: 0 });
  }

  private get viewModel() {
    return AppViewModel.Instance.QoLHistory;
  }

  async start() {
    await this.viewModel.init();
    this.historyEntries = this.viewModel.historyEntries;
  }

  onBack = () => {
    this.trigger(ScenarioTriggers.Back);
  }

  onTapEntry = (item: SurveyResults) => (event: GestureResponderEvent) => {
    const index = Math.max(0, this.historyEntries.map((entry) => entry.startDate).indexOf(item.startDate)); // using startDate here as indexOf() is not working when comparing the whole object. startDate will be unique
    this.viewModel.setSelectedEntry(item, index + 1);
    this.trigger(ScenarioTriggers.Submit);
  }

  renderListItem = ({ item }) => (
    <TouchableOpacity onPress={this.onTapEntry(item)}>
      <View style={styles.listItem}>
        <Text style={{ display: 'flex' }}>{formatDateMonthYear(item.date)}</Text>
        <View style={{ display: 'flex', flexDirection: 'row' }}>
          {item.focusedDomains && item.focusedDomains.map((slug: DomainSlug, index) => iconForDomain(slug, { display: 'flex', marginRight: index == item.focusedDomains.length - 1 ? 0 : 20 }))}
        </View>
        <View style={styles.smallCircle}>
          <Text style={styles.smallCircleText}>{Math.round(item.aggregateScore)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );



  renderContent() {
    return (
      <MasloPage style={this.baseStyles.page} onBack={this.onBack} theme={this.theme}>
        <Container style={[{ height: this._contentHeight, paddingTop: 52 }]}>
          {/* Title */}
          <View style={{ justifyContent: 'center', marginBottom: 35 }}>
            <Text style={[TextStyles.h2, styles.title]}>Quailty of Life History</Text>
          </View>
          {/* List of History Entries */}
          <FlatList
            data={this.historyEntries}
            renderItem={this.renderListItem}
            keyExtractor={item => `${item.date}`}
            indicatorStyle={'black'}
          />
        </Container>
      </MasloPage>
    );
  }
}

const styles = StyleSheet.create({
  sortButton: {
    marginBottom: 30,
    borderWidth: 1,
    borderRadius: 7,
    borderColor: '#CBC8CD',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  sortButtonTitle: {
    textDecorationLine: 'underline',
    color: Colors.survey.btnFontColor,
  },
  listItem: {
    borderBottomWidth: 1,
    borderColor: '#CBC8CD',
    padding: 10,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
  },
  icon: {
    display: 'flex',
    marginRight: 5,
    height: 20,
    width: 20,
  },
  smallCircle: {
    display: 'flex',
    marginLeft: 15,
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    borderColor: TextStyles.labelMedium.color,
    borderWidth: 1.4,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  smallCircleText: {
    color: TextStyles.labelMedium.color,
    fontSize: 15,
  },
});
