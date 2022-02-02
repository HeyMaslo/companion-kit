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
import AppController from 'src/controllers';

@observer
export class ReviewStrategiesView extends ViewState {

  private showButton = true;

  constructor(props) {
    super(props);
    this._contentHeight = this.persona.setupContainerHeightForceScrollDown({ transition: { duration: 0 } });
    this.hidePersona();

    this.onLearnMorePress = this.onLearnMorePress.bind(this);
  }

  private get viewModel() {
    return AppViewModel.Instance.Strategy;
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
      },
      theme: this.theme,
    });
  })

  onBack = () => {
    this.trigger(ScenarioTriggers.Back);
  }

  async onCompleteDomainAndStraegyFlow() {
    AppController.Instance.User.localSettings.updateStrategiesConfirmed(true);
    // Wait until the final confirmation button is pressed to schedule affirmation notifications
    // Anywhere else in the flow the user can go back and change selected domains 
    await AppController.Instance.User.notifications.scheduleTwentySevenAffirmationNotifications();   
    this.trigger(ScenarioTriggers.Submit);
  }

  renderListItem = ({ item }) => (
    <StrategyCard item={item} onSelectStrategy={(() => (null))} onLearnMorePress={this.onLearnMorePress} hideCheckbox={true} isSmallCard={true} theme={this.theme} />
  );

  public renderInnerContent(titleText: string, showButton: boolean, listData?: any[]): JSX.Element {
    this.showButton = showButton;
    return (
      <>
        {/* Title */}
        <View style={{ justifyContent: 'center', flexDirection: 'row', marginBottom: 20 }}>
          <Text style={[TextStyles.h2, styles.strategy]}>{titleText}</Text>
        </View>
        {/* List of Strategies */}
        <FlatList style={styles.list}
          data={listData || this.viewModel.selectedStrategies}
          renderItem={this.renderListItem}
          keyExtractor={item => item.internalId} />
      </>
    );
  }

  renderContent() {
    return (
      <MasloPage style={this.baseStyles.page} onBack={this.onBack} theme={this.theme}>
        <Container style={[{ height: this._contentHeight, paddingTop: 10 }]}>
          {this.renderInnerContent('Here are your focus strategies.', true)}
          {this.showButton && <Button title='CONTINUE' style={styles.selectButton} onPress={() => this.onCompleteDomainAndStraegyFlow()} theme={this.theme} />}
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
    marginBottom: 20,
  },
  icon: {
    display: 'flex',
    marginRight: 5,
    height: 20,
    width: 20,
  },

});
