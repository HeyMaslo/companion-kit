import { observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, LayoutChangeEvent, GestureResponderEvent, PixelRatio } from 'react-native';
import { Button, Container, MasloPage, StrategyCard } from 'src/components';
import TextStyles from 'src/styles/TextStyles';
import AppViewModel from 'src/viewModels';
import Colors from '../../constants/colors/Colors';
import { ScenarioTriggers } from '../abstractions';
import { ViewState } from './base';
import { months } from 'common/utils/dateHelpers';
import Layout from 'src/constants/Layout';
import { getPersonaRadius, PersonaScale } from '../persona';
import AppController from 'src/controllers';
import IconsOnCircle from './IconsOnCircle';
import { PersonaArmState } from 'dependencies/persona/lib';
import { hasNotch } from 'src/constants/devices';

const date = new Date();
const today = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

const pixelRatio = PixelRatio.get();
const containerMarginBottom = Layout.isSmallDevice ? 0 : 25;
const containerMarginTop = hasNotch ? 75 : 25;

type YourFocusDomainsViewState = {
  bottomWrapperTop: number,
}

@observer
export class YourFocusDomainsView extends ViewState<YourFocusDomainsViewState> {

  private domains: string[] = [];
  private ordRadius = getPersonaRadius();

    constructor(props) {
        super(props);
        // for testing
        this.persona.qolArmMagnitudes = PersonaArmState.createEmptyArmState();
        //
        this.domains = this.viewModel.selectedDomains || ['mood', 'physical'];
        this.onLearnMorePress = this.onLearnMorePress.bind(this);
        this.onLayoutIconCircle = this.onLayoutIconCircle.bind(this);
        this._contentHeight = this.layout.window.height - containerMarginTop;

        this.state = {
          bottomWrapperTop: 0,
        }
    }

    public get viewModel() {
        return AppViewModel.Instance.ChooseStrategy;
    }

    async start() {}


    onClose = () => {
      this.trigger(ScenarioTriggers.Cancel)
   }

    onLearnMorePress(id: string) {
      const found = this.viewModel.getStrategyById(id);
      if (found) {
        this.viewModel.learnMoreStrategy = found;
        this.trigger(ScenarioTriggers.Tertiary);
      } else {
        console.log(`Strategy with id: ${id} NOT found`)
      }
  }

  onLifeAreasPress = () => {
    console.log("HEREEE")
    this.trigger(ScenarioTriggers.Next)
  }

  onLayoutIconCircle(event: LayoutChangeEvent) {
    const { height } = event.nativeEvent.layout;
    this.persona.setupContainerHeight(0, null, 0);

    const bottomWrapperMarginTop = 20;
    this.setState({
      bottomWrapperTop: height + bottomWrapperMarginTop,
    })
  }

    renderListItem = ({ item }) => (
      <StrategyCard item={item} onLearnMorePress={this.onLearnMorePress} hideCheckbox={true} isSmallCard={true}/>
    );

    renderContent() {
        return (
            <MasloPage style={this.baseStyles.page} onClose={() => this.onClose()}>
                <Container style={[{height: this._contentHeight, marginTop: containerMarginTop, marginBottom: containerMarginBottom}]}>
                    <View pointerEvents={'box-none'} style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center'}}>
                      <IconsOnCircle circleRaius={this.ordRadius * 6} symbolSize={40} highlightedIndices={[1,8]} onLayout={this.onLayoutIconCircle}/>
                    </View>
                    <View pointerEvents={'box-none'} style={[styles.bottomWrapper, {top: this.state.bottomWrapperTop}]}>
                    <Button
                        title={'View All Life Areas'}
                        style={[styles.viewAllButton]}
                        onPress={this.onLifeAreasPress}
                    />
                    <Text style={[TextStyles.labelLarge, styles.focusStrategies]}>Your Focus Strategies:</Text>
                    <FlatList style={[styles.list]}
                              data={this.viewModel.selectedStrategies}
                              renderItem={this.renderListItem}
                              keyExtractor={item => item.id}/>
                              </View>
                </Container>
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({ 
bottomWrapper: {
  position: 'absolute',
  left: 20,
  right: 20,
  bottom: 0,
},
viewAllButton: {
  alignSelf: 'center',
  width: '90%',
  height: 50,
  margin: 5,
},
focusStrategies: {
  marginTop: 35,
  textAlign: 'center',
},
list: {
  marginTop: 25,
  width: '100%',
},
listItem: {
  borderWidth: 1,
  borderRadius: 7,
  borderColor: '#CBC8CD',
  padding: 10,
  marginBottom: 30,
},
});
