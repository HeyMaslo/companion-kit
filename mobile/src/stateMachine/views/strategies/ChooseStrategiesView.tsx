import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import AppViewModel from 'src/viewModels';
import { StyleSheet, Text, View, ScrollView, TouchableHighlight, TouchableOpacity, Animated, Dimensions, Alert, SafeAreaView, FlatList, Pressable } from 'react-native';
import { MasloPage, Container, Button, BackArrow, GradientChart, Card } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import TextStyles, { mainFontMedium } from 'src/styles/TextStyles';
import Colors from '../../../constants/colors/Colors';
import Images from 'src/constants/images';

// import { styles } from 'react-native-markdown-renderer';

import AppController from 'src/controllers';
import { observable } from 'mobx';

const minContentHeight = 300;
const { width } = Dimensions.get('window');

@observer
export class ChooseStrategiesView extends ViewState {

  @observable
  private dropDownIsExtended = false;
  private domains: string[] = [];

    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScrollDown({ transition: { duration: 0} });
        this.hidePersona();
        this.domains = this.viewModel.selectedDomains;
    }

    public get viewModel() {
        return AppViewModel.Instance.ChooseStrategy;
    }

    async start() {
        let possibleStrategies = await AppController.Instance.User.backend.getPossibleStrategies();
        this.viewModel.setAvailableStrategies(possibleStrategies);
        this.domains = this.viewModel.selectedDomains;
        this.forceUpdate();
    }

    onBack = () => {
        this.trigger(ScenarioTriggers.Back);
    }

    onClose = (): void | Promise<void> => this.runLongOperation(async () => {
        this.showModal({
            title: `Do you really want to stop? Your progress will not be saved.`,
            primaryButton: {
                text: 'yes, stop',
                action:  () => this.trigger(ScenarioTriggers.Cancel),
            },
            secondaryButton: {
                text: 'no, go back',
                action: this.hideModal,
            }
        });
    })

    nextPage = () => {
      this.trigger(ScenarioTriggers.Submit);
    }

    onLearnMorePress(id: string) {
      this.viewModel.learnMoreStrategy = this.viewModel.getStrategyById(id);
      this.trigger(ScenarioTriggers.Tertiary);
  }

    onSelectStrategy = (id: string) => {
      this.viewModel.selectStrategy(this.viewModel.getStrategyById(id))
    }

    changeFilterPressed = (strategyDomain: string) => {
      this.viewModel.filterAvailableStrategies(strategyDomain)
    }

    dropDown = () => {
      if (this.dropDownIsExtended) {
        this.viewModel.filterAvailableStrategies(null);
      }
      this.dropDownIsExtended = !this.dropDownIsExtended;
    }

    renderDropDownListItem = ({ item }) => (
      <TouchableOpacity onPress={() => this.changeFilterPressed(item)}>
        <View style={styles.dropDownlistItem}>
          <Text style={[TextStyles.btnTitle, {display: 'flex', color: Colors.button.buttonForm.text}]}>{item}</Text>
        </View>
      </TouchableOpacity>
    );

    renderListItem = ({ item }) => (
      <Pressable onPress={() => this.onSelectStrategy(item.id)}>
        <View style={styles.listItem}>
          <View style={{flexDirection: "row", justifyContent: 'space-between', alignItems: 'center'}}>
          <Text style={[TextStyles.p1, {display: 'flex', maxWidth: width - size - 70}]}>{item.title}</Text>
            <View style={[styles.checkbox, item.isChecked && styles.checkboxChecked, {display: 'flex'}]}>
                {item.isChecked && <Images.radioChecked width={8} height={6} />}
            </View>
          </View>
          <Text style={[TextStyles.p2, {paddingLeft: 7, paddingTop: 7}]}>{item.details}</Text>
          <View>
            <TouchableOpacity onPress={() => this.onLearnMorePress(item.id)}>
              <Text style={{paddingRight: 7, textAlign: 'right'}}>{'LEARN MORE >'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    );



    renderContent() {
        return (
            <MasloPage style={this.baseStyles.page} onClose={() => this.onClose()} onBack={() => this.onBack()}>
                <Container style={[{height: this._contentHeight, paddingTop: 10, paddingBottom: 10}]}>

                    {/* Title */}
                    <View style={{justifyContent: 'center', flexDirection: 'row', marginBottom: 20}}>
                        <Text style={[TextStyles.h2, styles.strategy]}>{'Choose up to 4 focus strategies below.'}</Text>
                    </View>

                    <View>
                    {this.domains.length < 3 ? 
                      <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                        {/* Sort Row of Three Buttons */}
                        <TouchableOpacity onPress={() => this.changeFilterPressed(null)}><Text style={[TextStyles.btnTitle, styles.rowButton, {textDecorationLine: 'underline'}]}>{'Show All'}</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => this.changeFilterPressed(this.domains[0])}><Text style={[TextStyles.btnTitle, styles.rowButton]}>{this.domains[0]}</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => this.changeFilterPressed(this.domains[1])}><Text style={[TextStyles.btnTitle, styles.rowButton]}>{this.domains[1]}</Text></TouchableOpacity>
                      </View>
                    :
                      <View>
                      {/* Sort Drop Down Button */}
                        <Button titleStyles={styles.sortButtonTitle} title='SHOW ALL' style={styles.sortButton} onPress={this.dropDown}/>
                        {this.dropDownIsExtended ? 
                         <FlatList style={styles.dropDownlist}    
                                   data={this.domains}
                                   renderItem={this.renderDropDownListItem}
                                   keyExtractor={item => item}
                                   scrollEnabled={false}/>
                        : null}
                      </View>
                      }
                      </View>

                    {/* List of Strategies */}
                    <FlatList style={styles.list}    
                              data={this.viewModel.availableStrategies}
                              renderItem={this.renderListItem}
                              keyExtractor={item => item.id}/>
                    <Button title='SELECT THESE STRATEGIES' style={styles.selectButton} onPress={this.nextPage} disabled={this.viewModel.selectedStrategies.length < 1}/>
                </Container>
            </MasloPage>
        );
    }
}

const size = 24;

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
    textDecorationLine: 'underline',
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
    flexDirection: "row", 
    justifyContent: 'center',
    padding: 20,
    // marginTop: 30,
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
    // width: width * 0.8,
    marginBottom: 30,
  },
  checkbox: {
    height: size,
    width: size,
    borderRadius: size / 2,
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

});
