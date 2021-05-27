import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import AppViewModel from 'src/viewModels';
import { StyleSheet, Text, View, ScrollView, TouchableHighlight, TouchableOpacity, Animated, Dimensions, Alert, SafeAreaView, FlatList } from 'react-native';
import { MasloPage, Container, Button, BackArrow, GradientChart, Card } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import TextStyles, { mainFontMedium } from 'src/styles/TextStyles';
import Colors from '../../../constants/colors/Colors';

// import { styles } from 'react-native-markdown-renderer';

import AppController from 'src/controllers';

const minContentHeight = 300;
const { width } = Dimensions.get('window');

@observer
export class ChooseStrategiesView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScrollDown({ transition: { duration: 0} });
        this.hidePersona();
    }

    public get viewModel() {
        return AppViewModel.Instance.ChooseStrategy;
    }

    async start() {
        let possibleStrategies = await AppController.Instance.User.backend.getPossibleStrategies();
        this.viewModel.setAvailableStrategies(possibleStrategies);
        this.forceUpdate();
    }

    private cancel = () => {
        this.trigger(ScenarioTriggers.Cancel);
    }

    private onLearnMorePress(id: string) {
      console.log('Learn more about: ', id);
  }

    onClose = (): void | Promise<void> => this.runLongOperation(async () => {
        this.showModal({
            title: `Do you really want to stop? Your progress will not be saved.`,
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

    onDetails = () => {
        this.trigger(ScenarioTriggers.Submit);
    }

    onSelectStrategy = (title: string) => {
        if (this.viewModel.selectStrategy(this.viewModel.getStrategyByTitle(title))) {
            AppController.Instance.User.backend.setStrategies(this.viewModel.selectedStrategies.map(s => s.id));
            this.trigger(ScenarioTriggers.Tertiary)
        } else {
            Alert.alert(
                'Oops',
                'Looks like you have already selected that Strategy.',
                [
                    { text: 'OK' },
                ]);
        }
    }

    renderListItem = ({ item }) => (
      <View style={styles.listItem}>
        <Text style={TextStyles.p1}>{item.title}</Text>
        {/* Checkmark circle */}
        <Text style={[TextStyles.p2, {paddingLeft: 7, paddingTop: 7}]}>{item.details}</Text>
        <View>
        <TouchableOpacity onPress={() => this.onLearnMorePress(item.id)}>
          <Text style={{paddingRight: 7, textAlign: 'right'}}>{'LEARN MORE >'}</Text>
        </TouchableOpacity>
        </View>
      </View>

    );



    renderContent() {
      console.log('availableStrategies', this.viewModel.availableStrategies.length)
        return (
            <MasloPage style={this.baseStyles.page} onClose={() => this.cancel()} onBack={() => this.cancel()}>
                <Container style={[{height: this._contentHeight, paddingTop: 10, paddingBottom: 10}]}>
                    {/* Title */}
                    <View style={{justifyContent: 'center', flexDirection: 'row', marginBottom: 20}}>
                        <Text style={[TextStyles.h2, styles.strategy]}>{'Choose up to 4 focus strategies below.'}</Text>
                    </View>
                    {/* Sort Drop Down Button */}
                    <Button titleStyles={styles.sortButtonTitle} title='SHOW ALL' style={styles.sortButton}/>
                    {/* List of Strategies */}
                    <FlatList style={styles.list}    
                    data={this.viewModel.availableStrategies}
                    renderItem={this.renderListItem}
                    keyExtractor={item => item.id}/>
                    <Button title='SELECT THESE STRATEGIES' style={styles.selectButton}/>
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
  }

});
