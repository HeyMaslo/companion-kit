import { observer } from 'mobx-react';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Button, Container, MasloPage, StrategyCard } from 'src/components';
import TextStyles from 'src/styles/TextStyles';
import AppViewModel from 'src/viewModels';
import Colors from '../../../constants/colors/Colors';
import { ScenarioTriggers } from '../../abstractions';
import { ViewState } from '../base';
import { AlertExitWithoutSave } from 'src/constants/alerts';

@observer
export class FocusStrategiesView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScrollDown({ transition: { duration: 0} });
        this.hidePersona();

        this.onLearnMorePress = this.onLearnMorePress.bind(this);
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
      <StrategyCard item={item} onSelectStrategy={(()=>(null))} onLearnMorePress={this.onLearnMorePress} hideCheckbox={true}/>
    );

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
    marginBottom: 30,
  },
  icon: {
    display: 'flex',
    marginRight: 5,
    height: 20,
    width: 20,
  },

});
