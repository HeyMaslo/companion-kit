import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import AppViewModel from 'src/viewModels';
import { StyleSheet, Text, View, ScrollView, TouchableHighlight, TouchableOpacity, Animated, Dimensions, Alert, SafeAreaView, FlatList } from 'react-native';
import { MasloPage, Container, Button, BackArrow, GradientChart, Card } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import TextStyles, { mainFontMedium } from 'src/styles/TextStyles';
import Colors from '../../../constants/colors/Colors';
import Images from 'src/constants/images';

// import { styles } from 'react-native-markdown-renderer';

import AppController from 'src/controllers';

const minContentHeight = 300;
const { width } = Dimensions.get('window');

@observer
export class FocusStrategiesView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScrollDown({ transition: { duration: 0} });
        this.hidePersona();
    }

    public get viewModel() {
        return AppViewModel.Instance.ChooseStrategy;
    }

    async start() {
        this.forceUpdate();
    }

    private cancel = () => {
        this.trigger(ScenarioTriggers.Cancel);
    }

    onLearnMorePress(id: string) {
      this.viewModel.learnMoreStrategy = this.viewModel.getStrategyById(id);
      this.trigger(ScenarioTriggers.Tertiary);
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

    onBack = () => {
      this.trigger(ScenarioTriggers.Back);
    }

    nextPage = () => {
      this.trigger(ScenarioTriggers.Submit);
    }

    renderListItem = ({ item }) => (
      <View style={styles.listItem}>
        <Text style={TextStyles.p1}>{item.title}</Text>
        <Text style={[TextStyles.p2, {paddingLeft: 7, paddingTop: 7}]}>{item.details}</Text>
        <View style={{flexDirection: "row", justifyContent: 'space-between', marginTop: 10}}>
        <View style={{display: 'flex', flexDirection: "row", justifyContent: 'flex-start'}}>
            {item.slugs.map((slug) => {
              return this.iconForDomain(slug);
            })}
            </View>
        <TouchableOpacity onPress={() => this.onLearnMorePress(item.id)}>
          <Text style={{paddingRight: 7, textAlign: 'right'}}>{'LEARN MORE >'}</Text>
        </TouchableOpacity>
        </View>
      </View>

    );

    private iconForDomain(d: string): JSX.Element {
      switch (d.toLowerCase()) {
        case 'sleep':
          return <View style={styles.icon}><Images.sleepIcon width={20} height={20}/></View>;
        case 'physical':
          return <View style={styles.icon}><Images.physicalIcon width={20} height={20}/></View>;
        case 'mood':
          return <View style={styles.icon}><Images.selfEsteemIcon width={20} height={20}/></View>;
        case 'cognition':
          return <View style={styles.icon}><Images.leisureIcon width={20} height={20}/></View>;
      }
    }

    renderContent() {
      console.log('availableStrategies', this.viewModel.availableStrategies.length)
        return (
            <MasloPage style={this.baseStyles.page} onClose={() => this.onClose()} onBack={this.onBack}>
                <Container style={[{height: this._contentHeight, paddingTop: 10, paddingBottom: 10}]}>
                    {/* Title */}
                    <View style={{justifyContent: 'center', flexDirection: 'row', marginBottom: 20}}>
                        <Text style={[TextStyles.h2, styles.strategy]}>{'Here are your focus strategies.'}</Text>
                    </View>
                    {/* List of Strategies */}
                    <FlatList style={styles.list}    
                    data={this.viewModel.selectedStrategies}
                    renderItem={this.renderListItem}
                    keyExtractor={item => item.id}/>
                    <Button title='CONTINUE' style={styles.selectButton} onPress={this.nextPage}/>
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
  },
  icon: {
    display: 'flex',
    marginRight: 5,
    height: 20,
    width: 20,
  },

});
