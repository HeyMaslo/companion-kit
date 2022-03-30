import { Strategy } from '../../../../../mobile/src/constants/Strategy';
import { observer } from 'mobx-react';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Container, MasloPage } from 'src/components';
import TextStyles from 'src/styles/TextStyles';
import AppViewModel from 'src/viewModels';
import { ScenarioTriggers } from '../../abstractions';
import { ViewState } from '../base';
import { HTMLStyles, iconForDomain, replaceListTags } from 'src/helpers/DomainHelper';
import RenderHTML from 'react-native-render-html';
import { domainNameForSlug, DomainSlug } from 'src/constants/Domain';
import Layout from 'src/constants/Layout';
import { strategyIllustrationForSlug } from 'src/helpers/StrategyHelper';

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
    AppViewModel.Instance.Resource.fetchResourcesForStrategy(this._learnMoreStrategy.slug, this._learnMoreStrategy.color);
    this.forceUpdate();
  }

  onBack = () => {
    this.trigger(ScenarioTriggers.Back);
  }

  onNext = () => {
    this.trigger(ScenarioTriggers.Next);
  }

  renderIconItem = ({ item }) => (
    <View style={[{ flexDirection: 'row', justifyContent: 'center' }]} key={item}>
      {iconForDomain(item, { marginRight: 20 }, this.theme.colors.foreground)}
      <Text style={[TextStyles.h2, styles.strategy, { marginBottom: 30 }]}>{domainNameForSlug(item)}</Text>
    </View>
  );

  renderContent() {
    const htmlSource = {
      html: replaceListTags(this._learnMoreStrategy.details)
    };

    return (
      <MasloPage style={this.baseStyles.page} onBack={() => this.onBack()} theme={this.theme}>
        <Container style={[styles.container, { height: this._contentHeight }]}>
          <ScrollView style={{ width: Layout.window.width }} contentContainerStyle={{ alignItems: 'center', marginHorizontal: 20, paddingBottom: 20 }}>
            <View style={{ alignItems: 'center', flexDirection: 'column', marginBottom: 20, paddingHorizontal: 20, width: '100%' }}>
              <Text style={[TextStyles.h2, { textAlign: 'center', marginBottom: 20 }]}>{this._learnMoreStrategy.friendlyTitle}</Text>
              {strategyIllustrationForSlug(this._learnMoreStrategy.slug, this.layout.window.height * 0.32, '100%')}
            </View>
            {/* HTML body */}
            <RenderHTML
              contentWidth={this.layout.window.width - 40}
              source={htmlSource}
              baseStyle={HTMLStyles.baseStyle}
              systemFonts={HTMLStyles.systemFonts}
              tagsStyles={HTMLStyles.tagsStyles}
            />
            <View style={{ marginTop: 40 }}>
              <Button title={'VIEW RESOURCES'} style={{ marginBottom: 10 }} onPress={this.onNext} theme={this.theme} />
              <Button title={'GO BACK'} isTransparent withBorder onPress={this.onBack} theme={this.theme} />
            </View>
          </ScrollView>
        </Container>
      </MasloPage>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 15,
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
