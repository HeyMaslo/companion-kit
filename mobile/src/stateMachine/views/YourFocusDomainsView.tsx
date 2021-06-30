import { observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, LayoutChangeEvent } from 'react-native';
import { Button, Container, MasloPage, StrategyCard } from 'src/components';
import TextStyles from 'src/styles/TextStyles';
import AppViewModel from 'src/viewModels';
import Colors from '../../constants/colors/Colors';
import { ScenarioTriggers } from '../abstractions';
import { ViewState } from './base';
import { months } from 'common/utils/dateHelpers';
import Layout from 'src/constants/Layout';
import { getPersonaRadius } from '../persona';
import AppController from 'src/controllers';
import IconsOnCircle from './IconsOnCircle';

const date = new Date();
const today = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

const containerMarginBottom =   Layout.isSmallDevice ?   0 : 25;
const contentHeightAdjustment = Layout.isSmallDevice ? -45 : containerMarginBottom;

@observer
export class YourFocusDomainsView extends ViewState {

  private domains: string[] = [];
  private domainsTitle: string = '';

  @observable
  private personaYPos: number = 0;
  private ordRadius = getPersonaRadius(0.75);

  @observable
  private strategylistTopMargin = 0;
  private containerMarginTop = 0;
  

    constructor(props) {
        super(props);
        this.domains = this.viewModel.selectedDomains || ['mood', 'physical'];
        this.domainsTitle = this.getDomainsTitle();
        this.onLearnMorePress = this.onLearnMorePress.bind(this);

        this._contentHeight = this.persona.setupContainerHeight(Layout.window.height) - contentHeightAdjustment;
        this.containerMarginTop = Layout.window.height - this._contentHeight - containerMarginBottom;

        this.personaYPos = -(this.containerMarginTop - containerMarginBottom) + (this._contentHeight / 10);
        this.persona.view = { ...this.persona.view, position: { x: this.persona.view.position.x, y: (this.personaYPos) * devicePixelRatio + this.ordRadius}, scale: 0.75 };
        this.persona.qolArmMagnitudes = { 'physical': 0, 'sleep': 0, 'mood': 0, 'cognition': 0, 'leisure': 0, 'relationships': 0, 'spiritual': 0, 'money': 0, 'home': 0, 'self-esteem': 0, 'independence': 0, 'identity': 0};
        // this.persona.enableSwipeDownInteraction = true;
        this.onPersonaSwipeDown = this.onPersonaSwipeDown.bind(this);
        // this.persona.onSwipeDownPassThreshold = this.onPersonaSwipeDown;

        console.log('--------------------------------------------')
        console.log('Layout.window.height: ', Layout.window.height)
        console.log('Container space to Top: ', this.containerMarginTop)
        console.log('this._contentHeight: ', this._contentHeight)
        console.log('Container space to Bottom: ', containerMarginBottom)
        console.log('--Persona--')
        console.log('personaRadius: ', this.ordRadius) 
        console.log('personaYPosition: ', this.personaYPos)
        console.log('--------------------------------------------')
    }

    public get viewModel() {
        return AppViewModel.Instance.ChooseStrategy;
    }

    async start() {}

    private getDomainsTitle(): string {
      switch (this.domains.length) {
        case 1:
          return this.capitalizeFirstLetter(this.domains[0])
        case 2:
          return this.capitalizeFirstLetter(this.domains[0])  + ' & ' + this.capitalizeFirstLetter(this.domains[1]);
        case 3:
          return this.capitalizeFirstLetter(this.domains[0])  + ', ' + this.capitalizeFirstLetter(this.domains[1])+ ' & ' + this.capitalizeFirstLetter(this.domains[2]);
        default:
          return 'INVALID number of domains'
      }
    }

    private capitalizeFirstLetter(str): string {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    onClose = () => {
      this.trigger(ScenarioTriggers.Cancel)
   }

    onLearnMorePress(id: string) {
      const found = this.viewModel.getStrategyById(id);
      if (found) {
        this.viewModel.learnMoreStrategy = found;
        this.trigger(ScenarioTriggers.Tertiary);
      } else {console.log(`Strategy with id: ${id} NOT found`)}
  }

  onPersonaSwipeDown() {
    console.log('onPersonaSwipeDown in YOURFOCUSDOMAIN')
    this.trigger(ScenarioTriggers.Next)
  }

  onLayoutTitleView(event: LayoutChangeEvent) {
    // const { height } = event.nativeEvent.layout;
    // const moveUp = (this._contentHeight - height) / 4;
    // this.personaYPos = -((this.containerMarginTop + height) - this.containerMarginBottom) + moveUp;
    // this.personaYPos = 0;
    // this.persona.view.position.y = (this.personaYPos) * devicePixelRatio + this.ordRadius;
  }

    renderListItem = ({ item }) => (
      <StrategyCard item={item} onLearnMorePress={this.onLearnMorePress}/>
    );

    renderContent() {
        return (
            <MasloPage style={this.baseStyles.page} onClose={() => this.onClose()}>
                <Container style={[{height: this._contentHeight, marginBottom: containerMarginBottom}]}>

                    {/* Title */}
                    <View style={[styles.titleContainer, {marginBottom: 0}]} onLayout={this.onLayoutTitleView}>
                      <Text style={[TextStyles.labelMedium, styles.date]}>{today}</Text>
                      <Text style={[TextStyles.labelLarge, styles.labelLarge]}>{'Your Focus Domain'}{this.domains.length == 1 ? ':' : 's:'}</Text>
                      <Text style={[TextStyles.h2, styles.title]}>{this.domainsTitle}</Text>
                    </View>

                    <IconsOnCircle circleRaius={this.ordRadius * 2.8} symbolSize={40} style={[styles.iconCircle]} highlightedIndices={[1,8]}/>
                    {/* <Text style={[TextStyles.labelMedium, {textAlign: 'center'}]}>Your Focus Strategies:</Text> */}
                    <FlatList style={[styles.list]}
                              data={this.viewModel.selectedStrategies}
                              renderItem={this.renderListItem}
                              keyExtractor={item => item.id}/>
                </Container>
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({ 
  titleContainer: {
    // backgroundColor: 'rgba(0, 100, 0, 0.25)',
    alignItems: 'center',
    flexDirection: 'column',
  },
  title: {
    textAlign: 'center',
  },
  iconCircle: {
    marginTop: 35,
    marginBottom: 35,
  },
  list: {
    marginBottom: 25,
    // backgroundColor: 'grey',
  },
  listItem: {
    borderWidth: 1,
    borderRadius: 7,
    borderColor: '#CBC8CD',
    padding: 10,
    marginBottom: 30,
  },
  date: {
    textTransform: 'uppercase',
    marginBottom: 25,
  },
  labelLarge: {
    marginBottom: 10,
},

});
