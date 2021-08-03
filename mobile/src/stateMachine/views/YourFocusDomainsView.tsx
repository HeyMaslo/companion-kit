import { observer } from 'mobx-react';
import { observable } from 'mobx';
import React from 'react';
import { FlatList, StyleSheet, Text, View, LayoutChangeEvent } from 'react-native';
import { Button, Container, MasloPage, StrategyCard } from 'src/components';
import TextStyles from 'src/styles/TextStyles';
import AppViewModel from 'src/viewModels';
import { ScenarioTriggers } from '../abstractions';
import { ViewState } from './base';
import Layout from 'src/constants/Layout';
import { getPersonaRadius } from '../persona';
import IconsOnCircle from './IconsOnCircle';
import { DomainName } from 'src/constants/Domain';

const containerMarginBottom = Layout.isSmallDevice ? 0 : 25;
const containerMarginTop = Layout.isSmallDevice ? 25 : 75;

type YourFocusDomainsViewState = {
  bottomWrapperTop: number,
}

@observer
export class YourFocusDomainsView extends ViewState<YourFocusDomainsViewState> {

  @observable
  private selectedDomains: DomainName[] = [];
  private ordRadius = getPersonaRadius();

    constructor(props) {
        super(props);
        this.onLearnMorePress = this.onLearnMorePress.bind(this);
        this.onLayoutIconCircle = this.onLayoutIconCircle.bind(this);
        this._contentHeight = this.layout.window.height - containerMarginTop;
        this.selectedDomains = AppViewModel.Instance.Domain.selectedDomains.map((d) => d.name);

        this.state = {
          bottomWrapperTop: 0,
        }
    }

    private get strategiesViewModel() {
      return AppViewModel.Instance.Strategy;
  }

    async start() {}

    onClose = () => {
      this.trigger(ScenarioTriggers.Cancel)
   }

    onLearnMorePress(id: string) {
      const found = this.strategiesViewModel.getStrategyById(id);
      if (found) {
        this.strategiesViewModel.learnMoreStrategy = found;
        this.trigger(ScenarioTriggers.Tertiary);
      } else {
        console.log(`Strategy with id: ${id} NOT found`)
      }
  }

  onLifeAreasPress = () => {
    this.trigger(ScenarioTriggers.Next)
  }

  onLayoutIconCircle(event: LayoutChangeEvent) {
    const { layout } = event.nativeEvent;
    this.persona.setupContainerHeight(0, null, (containerMarginTop - containerMarginBottom) + layout.height/2);

    const bottomWrapperMarginTop = 20;
    this.setState({
      bottomWrapperTop: layout.height + bottomWrapperMarginTop,
    })
  }

    renderListItem = ({ item }) => (
      <StrategyCard item={item} onLearnMorePress={this.onLearnMorePress} hideCheckbox={true} isSmallCard={true}/>
    );

    renderContent() {
        return (
            <MasloPage style={this.baseStyles.page} onClose={() => this.onClose()}>
                <Container style={[{height: this._contentHeight, marginTop: containerMarginTop, marginBottom: containerMarginBottom}]}>
                    <IconsOnCircle circleRaius={this.ordRadius * 6} symbolSize={40} highlightedDomains={this.selectedDomains} onLayout={this.onLayoutIconCircle}/>
                    <View pointerEvents={'box-none'} style={[styles.bottomWrapper, {top: this.state.bottomWrapperTop}]}>
                      <Button
                          title={'View All Life Areas'}
                          style={[styles.viewAllButton]}
                          onPress={this.onLifeAreasPress}
                      />
                      <Text style={[TextStyles.labelLarge, styles.focusStrategies]}>Your Focus Strategies:</Text>
                      <FlatList style={[styles.list]}
                                data={this.strategiesViewModel.selectedStrategies}
                                renderItem={this.renderListItem}
                                keyExtractor={item => item.internalId}/>
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
