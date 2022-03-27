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
  @observable
  private strategyColor: string = ''

  constructor(props) {
    super(props);
    this._contentHeight = this.persona.setupContainerHeightForceScrollDown({ transition: { duration: 0 } });
    this.hidePersona();
  }

  private get viewModel() {
    return AppViewModel.Instance.Resource;
  }

  async start() {
    this.resources = this.viewModel.availableResources;
    this.strategyColor = this.viewModel.strategyColor;
    console.log('this.viewModel.availableResources', this.resources)
  }

  onBack = () => {
    this.trigger(ScenarioTriggers.Back);
  }

  // onClose = () => {
  //   this.trigger(ScenarioTriggers.Cancel);
  // }

  renderListItem = ({ item }) => (
    <ResourceCard item={item} backgroundColor={this.strategyColor} isFavorite={false} onPress={null} onHeart={null} onClose={null} theme={this.theme} />
  );

  renderContent() {
    return (
      <MasloPage style={this.baseStyles.page} onBack={() => this.onBack()} theme={this.theme}>
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
          <Button title={'GO BACK TO STRATEGIES'} style={{ marginBottom: 25 }} onPress={this.onBack} isTransparent withBorder={true} theme={this.theme} />
        </Container >
      </MasloPage >
    );
  }
}

const styles = StyleSheet.create({
  list: {
    marginTop: 30,
    marginBottom: 15,
  }
});
