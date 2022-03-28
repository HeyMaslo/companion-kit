import { observable, computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Button, Container, MasloPage } from 'src/components';
import TextStyles from 'src/styles/TextStyles';
import AppViewModel from 'src/viewModels';
import { ScenarioTriggers } from '../abstractions';
import { ViewState } from './base';
import { Resource } from 'src/constants/Resource';
import ResourceCard from 'src/screens/components/ResourceCard';

@observer
export class ResourcesView extends ViewState {

  @observable
  private _resources: Resource[] = [];
  @computed
  get resources() {
    return this._resources.filter((r) => !this.hiddenResourceSlugs.includes(r.slug));
  }
  @observable
  private favoritedResourceSlugs: string[] = [];
  @observable
  private hiddenResourceSlugs: string[] = [];
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
    this._resources = this.viewModel.availableResources;
    this.favoritedResourceSlugs = this.viewModel.favoriteResourceSlugs;
    this.hiddenResourceSlugs = this.viewModel.hiddenResourceSlugs;
    this.strategyColor = this.viewModel.strategyColor;
  }

  onBack = () => {
    this.trigger(ScenarioTriggers.Back);
  }

  // onClose = () => {
  //   this.trigger(ScenarioTriggers.Cancel);
  // }

  favoriteResource = (slug: string) => {
    if (this.favoritedResourceSlugs.includes(slug)) {
      this.favoritedResourceSlugs = this.favoritedResourceSlugs.filter((s) => s != slug)
    } else {
      this.favoritedResourceSlugs.push(slug);
    }
    this.viewModel.favoriteResourceSlugs = this.favoritedResourceSlugs;
    this.viewModel.postUsersResources();
  }

  hideResource = (slug: string) => {
    this.favoritedResourceSlugs = this.favoritedResourceSlugs.filter((s) => s != slug);
    this.hiddenResourceSlugs.push(slug);
    this.viewModel.favoriteResourceSlugs = this.favoritedResourceSlugs;
    this.viewModel.hiddenResourceSlugs = this.hiddenResourceSlugs;
    this.viewModel.postUsersResources();
  }

  renderListItem = ({ item }) => (
    <ResourceCard item={item} backgroundColor={this.strategyColor} isFavorite={this.favoritedResourceSlugs.includes(item.slug)} onHeart={this.favoriteResource} onX={this.hideResource} theme={this.theme} />
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
          <FlatList<Resource> style={styles.list}
            data={this.resources}
            renderItem={this.renderListItem}
            keyExtractor={(item: Resource) => item.title}
            extraData={this.favoritedResourceSlugs.length} />
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
