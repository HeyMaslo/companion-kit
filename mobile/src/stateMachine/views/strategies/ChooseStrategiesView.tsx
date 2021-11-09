import { observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, Container, MasloPage, StrategyCard } from 'src/components';
import TextStyles from 'src/styles/TextStyles';
import AppViewModel from 'src/viewModels';
import Colors from '../../../constants/colors/Colors';
import { ScenarioTriggers } from '../../abstractions';
import { ViewState } from '../base';
import { AlertExitWithoutSave } from 'src/constants/alerts';
import { DomainName } from 'src/constants/Domain';

@observer
export class ChooseStrategiesView extends ViewState {

  @observable
  private dropDownIsExtended = false;
  private selectedDomainNames: string[] = [];
  private currentFilter: DomainName = null;

  constructor(props) {
    super(props);
    this._contentHeight = this.persona.setupContainerHeightForceScrollDown({ transition: { duration: 0 } });
    this.hidePersona();
    this.selectedDomainNames = (AppViewModel.Instance.Domain.selectedDomains.domains as string[]).concat(AppViewModel.Instance.Domain.selectedDomains.subdomains);

    this.onLearnMorePress = this.onLearnMorePress.bind(this);
    this.onSelectStrategy = this.onSelectStrategy.bind(this);
  }

  private get viewModel() {
    return AppViewModel.Instance.Strategy;
  }

  async start() {
    this.viewModel.selectedStrategies = [];
  }

  onBack = () => {
    this.trigger(ScenarioTriggers.Back);
  }

  onClose = (): void | Promise<void> => this.runLongOperation(async () => {
    this.showModal({
      title: AlertExitWithoutSave,
      primaryButton: {
        text: 'yes, stop',
        action: () => this.trigger(ScenarioTriggers.Cancel),
      },
      secondaryButton: {
        text: 'no, go back',
        action: this.hideModal,
      }
    });
  })

  onSubmit = () => {
    this.viewModel.postSelectedStrategies();
    this.trigger(ScenarioTriggers.Submit);
  }

  onLearnMorePress(id: string) {
    const found = this.viewModel.getStrategyById(id);
    if (found) {
      this.viewModel.learnMoreStrategy = found;
      this.trigger(ScenarioTriggers.Tertiary);
    }
  }

  onSelectStrategy = (id: string) => {
    this.viewModel.selectStrategy(this.viewModel.getStrategyById(id))
  }

  changeFilterPressed = (strategyDomain: DomainName) => {
    this.currentFilter = strategyDomain;
    this.viewModel.filterAvailableStrategies(strategyDomain)
  }

  dropDown = () => {
    if (this.dropDownIsExtended) {
      this.changeFilterPressed(null);
    }
    this.dropDownIsExtended = !this.dropDownIsExtended;
  }

  renderDropDownListItem = ({ item }) => (
    <TouchableOpacity onPress={() => this.changeFilterPressed(item)}>
      <View style={styles.dropDownlistItem}>
        <Text style={[TextStyles.btnTitle, { display: 'flex', color: Colors.button.buttonForm.text }, this.currentFilter == item ? { textDecorationLine: 'underline' } : null]}>{item}</Text>
      </View>
    </TouchableOpacity>
  );

  renderListItem = ({ item }) => (
    <StrategyCard item={item} onSelectStrategy={this.onSelectStrategy} onLearnMorePress={this.onLearnMorePress} />
  );

  renderContent() {
    return (
      <MasloPage style={this.baseStyles.page} onBack={() => this.onBack()}>
        <Container style={[{ height: this._contentHeight, paddingTop: 10 }]}>

          {/* Title */}
          <View style={{ justifyContent: 'center', flexDirection: 'row', marginBottom: 20 }}>
            <Text style={[TextStyles.h2, styles.strategy]}>{'Choose up to 4 focus strategies below.'}</Text>
          </View>

          <View>
            {this.selectedDomainNames.length < 3 ?
              <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                {/* Sort Row of Three Buttons */}
                <TouchableOpacity onPress={() => this.changeFilterPressed(null)}><Text style={[TextStyles.btnTitle, styles.rowButton, this.currentFilter == null ? { textDecorationLine: 'underline' } : null]}>{'Show All'}</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => this.changeFilterPressed(this.selectedDomainNames[0] as DomainName)}><Text style={[TextStyles.btnTitle, styles.rowButton, this.currentFilter == this.selectedDomainNames[0] ? { textDecorationLine: 'underline' } : null]}>{this.selectedDomainNames[0]}</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => this.changeFilterPressed(this.selectedDomainNames[1] as DomainName)}><Text style={[TextStyles.btnTitle, styles.rowButton, this.currentFilter == this.selectedDomainNames[1] ? { textDecorationLine: 'underline' } : null]}>{this.selectedDomainNames[1]}</Text></TouchableOpacity>
              </View>
              :
              <View>
                {/* Sort Drop Down Button */}
                <Button titleStyles={[styles.sortButtonTitle, this.currentFilter == null ? { textDecorationLine: 'underline' } : null]} title='SHOW ALL' style={styles.sortButton} onPress={this.dropDown} />
                {this.dropDownIsExtended &&
                  <FlatList style={styles.dropDownlist}
                    data={this.selectedDomainNames}
                    renderItem={this.renderDropDownListItem}
                    keyExtractor={item => item}
                    scrollEnabled={false} />}
              </View>
            }
          </View>

          {/* List of Strategies */}
          <FlatList style={styles.list}
            data={this.viewModel.availableStrategies}
            renderItem={this.renderListItem}
            keyExtractor={item => item.internalId} />
          <Button title={'SELECT ' + (this.viewModel.selectedStrategies.length < 1 ? 'STRATEGIES' : (this.viewModel.selectedStrategies.length == 1 ? 'THIS STRATEGY' : 'THESE STRATEGIES'))} style={styles.selectButton} onPress={this.onSubmit} disabled={this.viewModel.selectedStrategies.length < 1} />
        </Container>
      </MasloPage>
    );
  }
}

const checkboxSize = 24;

const styles = StyleSheet.create({
  rowButton: {
    display: 'flex',
    color: Colors.survey.btnFontColor,
  },
  sortButton: {
    borderWidth: 1,
    borderRadius: 7,
    borderColor: '#CBC8CD',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  sortButtonTitle: {
    color: Colors.survey.btnFontColor,
  },
  dropDownTitle: {
    display: 'flex',
    color: Colors.survey.btnFontColor,
  },
  dropDownlist: {
    marginTop: 5,
    display: 'flex',
    flexGrow: 0,
    borderWidth: 1,
    borderRadius: 7,
    borderColor: '#CBC8CD',
  },
  dropDownlistItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
  },
  list: {
    marginTop: 30,
    marginBottom: 25,
  },
  listItem: {
    borderWidth: 1,
    borderRadius: 7,
    borderColor: '#CBC8CD',
    padding: 10,
    marginBottom: 30,
  },
  strategy: {
    textAlign: 'center',
  },
  selectButton: {
    marginBottom: 20,
  },
  checkbox: {
    height: checkboxSize,
    width: checkboxSize,
    borderRadius: checkboxSize / 2,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: Colors.radioButton.checkedBg,
    borderWidth: 0,
  },
  icon: {
    display: 'flex',
    marginRight: 5,
    height: 20,
    width: 20,
  },

});
