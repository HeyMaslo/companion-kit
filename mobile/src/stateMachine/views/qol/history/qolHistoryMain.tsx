import { observer } from 'mobx-react';
import React from 'react';
import { FlatList, GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, Container, MasloPage } from 'src/components';
import TextStyles from 'src/styles/TextStyles';
import AppViewModel from 'src/viewModels';
import Colors from '../../../../constants/colors/Colors';
import { ScenarioTriggers } from '../../../abstractions';
import { ViewState } from '../../base';
import { AlertExitWithoutSave } from 'src/constants/alerts';
import Images from 'src/constants/images';
import { iconForDomain } from 'src/helpers/DomainHelper';
import { DomainName } from 'src/constants/Domain';
import { SurveyResults } from 'common/database/repositories/SurveyResultsRepo';
import { formatDateMonthYear } from 'common/utils/dateHelpers';
import { observable } from 'mobx';
import { getUniqueID } from 'react-native-markdown-renderer';

@observer
export class QolHistoryMainView extends ViewState {

  @observable
  private historyEntries: SurveyResults[];

    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScrollDown({ transition: { duration: 0} });
        this.hidePersona();
    }

    private get viewModel() {
      return AppViewModel.Instance.QoLHistory;
    }

    async start() {
      await this.viewModel.init();
      this.historyEntries = this.viewModel.historyEntries;
    }

    private cancel = () => {
        this.trigger(ScenarioTriggers.Cancel);
    }

    onClose = () => {
        this.cancel();
    }

    onBack = () => {
      this.trigger(ScenarioTriggers.Back);
    }

    onTapEntry = (item: SurveyResults) => (event: GestureResponderEvent) => {
      this.viewModel.selectedEntry = item;
      this.trigger(ScenarioTriggers.Submit);
    }

    renderListItem = ({ item }) => (
      <TouchableOpacity onPress={this.onTapEntry(item)}>
        <View style={styles.listItem}>
          <Text style={{display: 'flex'}}>{formatDateMonthYear(item.date)}</Text>
          <View style={{display: 'flex', flexDirection: 'row'}}>
           {iconForDomain(DomainName.MONEY, {display: 'flex', marginRight: 20})}
           {iconForDomain(DomainName.INDEPENDENCE, {display: 'flex', marginRight: 0})}
          </View>
          <View style={styles.smallCircle}>
          <Text style={[TextStyles.labelLarge, styles.smallCircleText]}>{Math.round(item.aggregateScore)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );



    renderContent() {
        return (
          <MasloPage style={this.baseStyles.page} onClose={() => this.onClose()} onBack={this.onBack}>
              <Container style={[{height: this._contentHeight, paddingTop: 10}]}>
                {/* Title */}
                <View style={{justifyContent: 'center', marginBottom: 35}}>
                  <Text style={[TextStyles.h2, styles.title]}>Quailty of Life History</Text>
                </View>
                {/* List of History Entries */}
                <FlatList style={styles.list}     
                  data={this.historyEntries}
                  renderItem={this.renderListItem}
                  keyExtractor={item => getUniqueID()}
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
  list: {
    marginBottom: 25,
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
    height: 34,
    width: 34,
    borderRadius: 17,
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
});
