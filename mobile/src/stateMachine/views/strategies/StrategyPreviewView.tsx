import { Strategy } from '../../../constants/Strategy';
import { observer } from 'mobx-react';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ActivityButton, ButtonBlock, Button, Container, MasloPage } from 'src/components';
import TextStyles from 'src/styles/TextStyles';
import AppViewModel from 'src/viewModels';
import { ScenarioTriggers } from '../../abstractions';
import { ViewState } from '../base';
import { iconForDomain } from 'src/helpers/DomainHelper';
import { domainNameForSlug, DomainSlug } from 'src/constants/Domain';
import Layout from 'src/constants/Layout';
import Images from 'src/constants/images';

@observer
export class StrategyPreviewView extends ViewState {

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

  onNext = () => {
    this.trigger(ScenarioTriggers.Next);
  }

  renderIconItem = ({ item }) => (
    <View style={[{ flexDirection: 'row', justifyContent: 'center' }]} key={item}>
      {iconForDomain(item, { marginRight: 20 }, this.theme.colors.foreground)}
      <Text style={[TextStyles.h2, { textAlign: 'center', marginBottom: 30 }]}>{domainNameForSlug(item)}</Text>
    </View>
  );

  renderBulletPoint(str: string, key: string) {
    return (
      <View key={key} style={{ flexDirection: 'row', marginVertical: 10 }}>
        <Text style={this.textStyles.p2}>{'\u2022'}</Text>
        <Text style={[this.textStyles.p2, { flex: 1, paddingLeft: 5 }]}>{str}</Text>
      </View>
    );
  }

  renderContent() {
    return (
      <MasloPage style={[this.baseStyles.page, { backgroundColor: this._learnMoreStrategy.color }]} onBack={() => this.onBack()} theme={this.theme}>
        <Container style={[{ height: this._contentHeight, paddingTop: 15, paddingHorizontal: 0, flexDirection: 'column' }]}>
          {/* Title */}
          <View style={{ alignItems: 'center', flexDirection: 'column', marginBottom: 20, paddingHorizontal: 20 }}>
            <Text style={[TextStyles.h2, { textAlign: 'center', marginBottom: 20 }]}>{this._learnMoreStrategy.title}</Text>
            <Images.StrategyTestIllustration height={this.layout.window.height * 0.32} pointerEvents={'none'} />
            {/*  height={height}  */}
          </View>

          {/* Bottom Card */}
          <View style={styles.card}>
            {/* Domain tag (icon + name) */}
            {/* <View>

            </View> */}

            <Text style={[this.textStyles.labelExtraLarge, { marginVertical: 10 }]}>What to know</Text>
            <View style={{ marginBottom: 0, flexGrow: 1 }}>
              {this._learnMoreStrategy.whatToKnowBullets.map((b, index) => this.renderBulletPoint(b, 'wtk' + index))}
            </View>
            <View style={{ marginBottom: 20 }}>
              <Button title={'READ MORE'} style={{ width: '100%', marginBottom: 10 }} onPress={this.onNext} theme={this.theme} />
              <Button title={'GO BACK TO STRATEGIES'} style={{ width: '100%' }} isTransparent withBorder onPress={this.onBack} theme={this.theme} />
            </View>
          </View>

        </Container>
      </MasloPage>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexGrow: 1,
    backgroundColor: 'white',
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 35,
    flexDirection: 'column'
  },
});
