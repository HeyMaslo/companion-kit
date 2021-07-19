import { observer } from 'mobx-react';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Button, Container, MasloPage, StrategyCard } from 'src/components';
import TextStyles from 'src/styles/TextStyles';
import AppViewModel from 'src/viewModels';
import Colors from '../../../../constants/colors/Colors';
import { ScenarioTriggers } from '../../../abstractions';
import { ViewState } from '../../base';
import { AlertExitWithoutSave } from 'src/constants/alerts';
import Images from 'src/constants/images';
import { iconForDomain } from 'src/helpers/DomainHelper';
import { DomainName } from 'src/constants/Domain';
import AppController from 'src/controllers';
import { SurveyResults } from 'common/database/repositories/SurveyResultsRepo';
import { months } from 'common/utils/dateHelpers';

@observer
export class QolHistoryMainView extends ViewState {

  private historyEntries: SurveyResults[]; 

    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScrollDown({ transition: { duration: 0} });
        this.hidePersona();

        this.onLearnMorePress = this.onLearnMorePress.bind(this);
    }

    async start() {
        this.historyEntries = await AppController.Instance.User.qol.getAllSurveyResults();
        this.historyEntries.sort((a, b) => a.date - b.date)
        this.forceUpdate();
    }

    private cancel = () => {
        this.trigger(ScenarioTriggers.Cancel);
    }

    onLearnMorePress(id: string) {
      // this.viewModel.learnMoreStrategy = this.viewModel.getStrategyById(id);
      this.trigger(ScenarioTriggers.Tertiary);
  }

    onClose = (): void | Promise<void> => this.runLongOperation(async () => {
        this.showModal({
            title: AlertExitWithoutSave,
            primaryButton: {
                text: 'yes, stop',
                action: this.cancel,
            },
            secondaryButton: {
                text: 'no, go back',
                action: this.hideModal,
            }
        });
    })

    onBack = () => {
      this.trigger(ScenarioTriggers.Back);
    }

    nextPage = () => {
      this.trigger(ScenarioTriggers.Submit);
    }

    renderListItem = ({ item }) => (
     <View style={styles.listItem}>
       <Text style={{display: 'flex'}}>{this.dateStringForDisplay(new Date(item.date))}</Text>
       <View style={{display: 'flex', flexDirection: 'row'}}>
        {iconForDomain(DomainName.MONEY, {display: 'flex', marginRight: 20})}
        {iconForDomain(DomainName.INDEPENDENCE, {display: 'flex', marginRight: 0})}
       </View>
       <View style={{display: 'flex'}}>
        <Images.recordIcon/>
       </View>
     </View>
    );

    private dateStringForDisplay(date: Date) {
      return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }

    renderContent() {
        return (
          <MasloPage style={this.baseStyles.page} onClose={() => this.onClose()} onBack={this.onBack}>
              <Container style={[{height: this._contentHeight, paddingTop: 10}]}>
                {/* Title */}
                <View style={{justifyContent: 'center', marginBottom: 35}}>
                  <Text style={[TextStyles.h2, styles.title]}>Quailty of Life History</Text>
                </View>
                {/* List of Strategies */}
                <FlatList style={styles.list}    
                  data={this.historyEntries}
                  renderItem={this.renderListItem}
                  keyExtractor={item => item.id}/>
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

});
