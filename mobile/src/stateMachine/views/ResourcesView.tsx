import { observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Button, Container, MasloPage } from 'src/components';
import TextStyles from 'src/styles/TextStyles';
import AppViewModel from 'src/viewModels';
import { ScenarioTriggers } from '../abstractions';
import { ViewState } from './base';
import { AlertExitWithoutSave } from 'src/constants/alerts';
import { Resource, ResourceType } from 'src/constants/Resource';
import ResourceCard from 'src/screens/components/ResourceCard';

@observer
export class ResourcesView extends ViewState {

  @observable
  private resources: Resource[] = [];

  constructor(props) {
    super(props);
    this._contentHeight = this.persona.setupContainerHeightForceScrollDown({ transition: { duration: 0 } });
    this.hidePersona();
    this.onLearnMorePress = this.onLearnMorePress.bind(this);
    this.onSelectStrategy = this.onSelectStrategy.bind(this);
  }

  private get viewModel() {
    return AppViewModel.Instance.Resource;
  }

  async start() {
    this.resources = this.viewModel.availableResources;
  }

  onBack = () => {
    this.trigger(ScenarioTriggers.Back);
  }

  onClose = (): void | Promise<void> => this.runLongOperation(async () => {
    this.showModal({
      title: AlertExitWithoutSave,
      primaryButton: {
        text: 'yes, stop',
        action: () => {
          this.trigger(ScenarioTriggers.Cancel);
        },
      },
      secondaryButton: {
        text: 'no, go back',
        action: this.hideModal,
      },
      theme: this.theme,
    });
  })

  onLearnMorePress(id: string) {
    // const found = this.viewModel.getStrategyBySlug(id);
    // if (found) {
    //   this.viewModel.learnMoreStrategy = found;
    //   this.trigger(ScenarioTriggers.Tertiary);
    // }
  }

  onSelectStrategy = (id: string) => {
    // this.viewModel.selectStrategy(this.viewModel.getStrategyBySlug(id));
    // this.numberOfSelectedStrategies = this.viewModel.selectedStrategies.length;
  }

  renderListItem = ({ item }) => (
    <ResourceCard item={item} backgroundColor={''} isFavorite={false} onPress={null} onHeart={null} onClose={null} theme={this.theme} />
  );

  renderContent() {
    return (
      <MasloPage style={this.baseStyles.page} onClose={() => this.onClose()} onBack={() => this.onBack()} theme={this.theme}>
        <Container style={[{ height: this._contentHeight, paddingTop: 10 }]}>

          {/* Title */}
          <View style={{ justifyContent: 'center', flexDirection: 'row', marginBottom: 20 }}>
            <Text style={[TextStyles.h2, { textAlign: 'center', }]}>{'Here are some strategy resources:'}</Text>
          </View>

          {/* List of Strategies */}
          < FlatList<Resource> style={styles.list}
            data={this.resources}
            renderItem={this.renderListItem}
            keyExtractor={(item: Resource) => item.title} />
          <Button title={'GO BACK TO STRATEGIES'} style={{ marginBottom: 20 }} onPress={this.onBack} isTransparent theme={this.theme} />
        </Container >
      </MasloPage >
    );
  }
}

const styles = StyleSheet.create({
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
  }
});
