import { Strategy } from '../../../../../mobile/src/constants/Strategy';
import { observer } from 'mobx-react';
import React from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Container, MasloPage } from 'src/components';
import TextStyles from 'src/styles/TextStyles';
import AppViewModel from 'src/viewModels';
import { ScenarioTriggers } from '../../abstractions';
import { ViewState } from '../base';
import { iconForDomain } from 'src/helpers/DomainHelper';
import Layout from 'src/constants/Layout';
import { DomainName } from 'src/constants/Domain';

@observer
export class StrategyDetailsView extends ViewState {

  private _learnMoreStrategy: Strategy;

  constructor(props) {
    super(props);
    this._contentHeight = this.persona.setupContainerHeightForceScrollDown({ transition: { duration: 0 } });
    this.hidePersona();
    this._learnMoreStrategy = this.viewModel.learnMoreStrategy;
  }

  private get viewModel() {
    return AppViewModel.Instance.Strategy;
  }

  async start() {
    this._learnMoreStrategy = this.viewModel.learnMoreStrategy;
    this.forceUpdate();
  }

  onBack = () => {
    this.trigger(ScenarioTriggers.Back);
  }

  private capitalizeFirstLetter(str: string) {
    return str.charAt(0).toLocaleUpperCase() + str.slice(1).toLocaleLowerCase();
  }

  renderIconItem = ({ item }) => (
    <View style={[styles.listItem, { flexDirection: 'row', justifyContent: 'center' }]}>
      {iconForDomain(item, { marginRight: 20 }, this.theme.colors.foreground)}
      <Text style={[TextStyles.h2, styles.strategy, { marginBottom: 10 }]}>{this.capitalizeFirstLetter(item)}</Text>
    </View>
  );

  renderContent() {
    return (
      <MasloPage style={this.baseStyles.page} onBack={() => this.onBack()} theme={this.theme}>
        <Container style={[{ height: this._contentHeight, paddingTop: 10, paddingBottom: 10 }]}>
          {/* Title */}
          <View style={{ justifyContent: 'center', flexDirection: 'row', marginBottom: 20 }}>
            <Text style={[TextStyles.h2, styles.strategy]}>{this._learnMoreStrategy.title}</Text>
          </View>
          {/* Subtitle */}
          <Text style={[TextStyles.p2, styles.strategy, { color: this.theme.colors.midground }]}>{'This strategy targets personal improvement in these life areas:'}</Text>
          {/* Icon Container */}
          <FlatList style={styles.list}
            data={this.viewModel.learnMoreStrategy.associatedDomainNames.filter((dom) => dom != DomainName.PHYSICAL)}
            renderItem={this.renderIconItem}
            keyExtractor={item => item}
            scrollEnabled={false} />
          {/* Body */}
          <ScrollView style={{ width: Layout.window.width, marginLeft: -20 }} contentContainerStyle={{ paddingHorizontal: 20 }}>
            <Text style={[TextStyles.p1, styles.body]}>
              {this._learnMoreStrategy.details}
            </Text>
          </ScrollView>
        </Container>
      </MasloPage>
    );
  }
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 0,
    marginTop: 30,
    marginBottom: 15,
  },
  listItem: {
    //  paddingTop: 10,
  },
  strategy: {
    textAlign: 'center',
  },
  body: {
    marginTop: 20,
  },

});
