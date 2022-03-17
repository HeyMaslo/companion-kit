import { Strategy } from '../../../../../mobile/src/constants/Strategy';
import { observer } from 'mobx-react';
import React from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Container, MasloPage } from 'src/components';
import TextStyles from 'src/styles/TextStyles';
import AppViewModel from 'src/viewModels';
import { ScenarioTriggers } from '../../abstractions';
import { ViewState } from '../base';
import { HTMLStyles, iconForDomain, replaceListTags } from 'src/helpers/DomainHelper';
import RenderHTML from 'react-native-render-html';
import { DomainSlug } from 'src/constants/Domain';
import Layout from 'src/constants/Layout';

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
    <View style={[{ flexDirection: 'row', justifyContent: 'center' }]} key={item}>
      {iconForDomain(item, { marginRight: 20 }, this.theme.colors.foreground)}
      <Text style={[TextStyles.h2, styles.strategy, { marginBottom: 30 }]}>{this.capitalizeFirstLetter(item)}</Text>
    </View>
  );

  renderContent() {
    const htmlSource = {
      html: replaceListTags(this._learnMoreStrategy.details)
    };

    return (
      <MasloPage style={this.baseStyles.page} onBack={() => this.onBack()} theme={this.theme}>
        <Container style={[styles.container, { height: this._contentHeight }]}>
          <ScrollView style={{ width: Layout.window.width }} contentContainerStyle={{ alignItems: 'center', marginHorizontal: 20 }}>
            {/* Title */}
            <View style={{ justifyContent: 'center', flexDirection: 'row', marginBottom: 20 }}>
              <Text style={[TextStyles.h2, styles.strategy]}>{this._learnMoreStrategy.title}</Text>
            </View>
            {/* Subtitle */}
            <Text style={[TextStyles.p2, styles.strategy, { marginBottom: 20, color: this.theme.colors.midground }]}>{'This strategy targets personal improvement in these life areas:'}</Text>
            {/* Icon Container */}
            {this.viewModel.learnMoreStrategy.domains.filter((dom) => dom != DomainSlug.PHYSICAL).map((slug) => {
              return this.renderIconItem({ item: slug });
            })}
            {/* HTML body */}
            <RenderHTML
              contentWidth={this.layout.window.width - 40}
              source={htmlSource}
              baseStyle={HTMLStyles.baseStyle}
              systemFonts={HTMLStyles.systemFonts}
              tagsStyles={HTMLStyles.tagsStyles}
            />
          </ScrollView>
        </Container>
      </MasloPage>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingBottom: 15,
    alignItems: 'center',
  },
  list: {
    flexGrow: 0,
    marginTop: 30,
    marginBottom: 15,
  },
  strategy: {
    textAlign: 'center',
  },
  body: {
    marginTop: 20,
  },

});
