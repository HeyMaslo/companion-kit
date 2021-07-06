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
import { PersonaArmState } from 'dependencies/persona/lib';

const date = new Date();
const today = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

const containerMarginBottom = Layout.isSmallDevice ? 0 : 25;
const containerMarginTop = 15;

type YourFocusDomainsViewState = {
  strategylistTop: number,
}

@observer
export class YourFocusDomainsView extends ViewState<YourFocusDomainsViewState> {

  private domains: string[] = [];
  private domainsTitle: string = '';
  private ordRadius = getPersonaRadius();
  

    constructor(props) {
        super(props);
        // for testing
        this.persona.qolArmMagnitudes = PersonaArmState.createEmptyArmState();
        //
        this.domains = this.viewModel.selectedDomains || ['mood', 'physical'];
        this.domainsTitle = this.getDomainsTitle();
        this.onLearnMorePress = this.onLearnMorePress.bind(this);
        this.onLayoutIconCircle = this.onLayoutIconCircle.bind(this);
        this.persona.setupContainerHeight(0, null, this.layout.window.height / 2 - 80/2);
        this._contentHeight = this.layout.window.height - containerMarginTop;

        this.state = {
          strategylistTop: 0,
        }
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
      } else {
        console.log(`Strategy with id: ${id} NOT found`)
      }
  }

  onTapPersona() {
    this.trigger(ScenarioTriggers.Next)
  }

  onLayoutIconCircle(event: LayoutChangeEvent) {
    const { height } = event.nativeEvent.layout;
    this.setState({
      strategylistTop: (this.layout.window.height / 2 - 40) + height / 2,
    })
  }

    renderListItem = ({ item }) => (
      <StrategyCard item={item} onLearnMorePress={this.onLearnMorePress}/>
    );

    renderContent() {
        return (
            <MasloPage style={this.baseStyles.page} onClose={() => this.onClose()}>
                <Container style={[{height: this._contentHeight, marginTop: containerMarginTop, marginBottom: containerMarginBottom}]}>

                    {/* Title */}
                    <View style={[styles.titleContainer]}>
                      <Text style={[TextStyles.labelMedium, styles.date]}>{today}</Text>
                      <Text style={[TextStyles.labelLarge, styles.labelLarge]}>{'Your Focus Domain'}{this.domains.length == 1 ? ':' : 's:'}</Text>
                      <Text style={[TextStyles.h2, styles.title]}>{this.domainsTitle}</Text>
                    </View>
                    <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 80, justifyContent: 'center', alignItems: 'center'}}>
                      <IconsOnCircle circleRaius={this.ordRadius * 6} symbolSize={40} highlightedIndices={[1,8]} onLayout={this.onLayoutIconCircle}/>
                    </View>
                    <View style={[styles.bottomWrapper, {top: this.state.strategylistTop}]}>
                    <Button
                        title={'View Life Areas'}
                        style={[styles.button]}
                        titleStyles={styles.buttonTitle}
                        onPress={() => null}
                        isTransparent
                    />
                    <Text style={[TextStyles.labelMedium, styles.otherLabel]}>Your Focus Strategies:</Text>
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
  titleContainer: {
    alignItems: 'center',
    flexDirection: 'column',
  },
  title: {
    textAlign: 'center',
  },
  date: {
    textTransform: 'uppercase',
    marginBottom: 25,
  },
  labelLarge: {
    marginBottom: 10,
},
bottomWrapper: {
  position: 'absolute',
  left: 20,
  right: 20,
  bottom: 0,
},
button: {
  fontWeight: '500',
  letterSpacing: 1.79,
},
buttonTitle: {
  borderWidth: 1,
  borderRadius: 5,
  color: 'black',
  fontSize: 10,
  padding: 10,
},
otherLabel: {
  marginTop: 10,
  textAlign: 'center',
},
list: {
  marginTop: 10,
  width: '100%',
  backgroundColor: 'grey'
},
listItem: {
  borderWidth: 1,
  borderRadius: 7,
  borderColor: '#CBC8CD',
  padding: 10,
  marginBottom: 30,
},
});
