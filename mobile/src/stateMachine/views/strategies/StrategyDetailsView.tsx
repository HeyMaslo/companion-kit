import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import AppViewModel from 'src/viewModels';
import { StyleSheet, Text, View, ScrollView, TouchableHighlight, TouchableOpacity, Animated, Dimensions, Alert, SafeAreaView, FlatList } from 'react-native';
import { MasloPage, Container, Button, BackArrow, GradientChart, Card } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import TextStyles, { mainFontMedium } from 'src/styles/TextStyles';
import Colors from '../../../constants/colors/Colors';
import Images from 'src/constants/images';

// import { styles } from 'react-native-markdown-renderer';

import AppController from 'src/controllers';
import { StrategyIded } from 'common/models/QoL';

const minContentHeight = 300;
const { width } = Dimensions.get('window');

@observer
export class StrategyDetailsView extends ViewState {

    private _learnMoreStrategy: StrategyIded;

    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScrollDown({ transition: { duration: 0} });
        this.hidePersona();
        this._learnMoreStrategy = this.viewModel.learnMoreStrategy;
    }

    public get viewModel() {
        return AppViewModel.Instance.ChooseStrategy;
    }

    async start() {
        this._learnMoreStrategy = this.viewModel.learnMoreStrategy;
        this.forceUpdate();
    }

    private cancel = () => {
        this.trigger(ScenarioTriggers.Cancel);
    }

    private capitalizeFirstLetter(str: string) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    renderIconItem = ({ item }) => (
        <View style={[styles.listItem, {flexDirection: "row", justifyContent: 'center'}]}>
          {/* keyIcon is currently a placholder */}
          <Images.keyIcon width={30} height={30} style={{display: 'flex', marginRight: 20,}}/>
          <Text style={[TextStyles.h2, styles.strategy, {display: 'flex'}]}>{this.capitalizeFirstLetter(item)}</Text>
        </View>
    );


    renderContent() {
        return (
            <MasloPage style={this.baseStyles.page} onBack={() => this.cancel()}>
                <Container style={[{height: this._contentHeight, paddingTop: 10, paddingBottom: 10}]}>
                    {/* Title */}
                    <View style={{justifyContent: 'center', flexDirection: 'row', marginBottom: 20}}>
                        <Text style={[TextStyles.h2, styles.strategy]}>{this._learnMoreStrategy.title}</Text>
                    </View>
                    {/* Subtitle */}
                    <Text style={[TextStyles.p2, styles.strategy]}>{'This strategy targets personal improvement in these life domains:'}</Text>
                    {/* Icon Container */}
                    <FlatList style={styles.list}    
                    data={this.viewModel.learnMoreStrategy.slugs}
                    renderItem={this.renderIconItem}
                    keyExtractor={item => item}
                    scrollEnabled={false}/>
                    {/* Body */}
                    <Text style={[TextStyles.p1, styles.body]}>{this._learnMoreStrategy.details}</Text>
                </Container>
            </MasloPage>
        );
    }
}

const size = 24;

const styles = StyleSheet.create({ 
  list: {
    flexGrow: 0,
    marginTop: 50,
    // paddingLeft: width/4.5,
  },
  listItem: {
    // borderWidth: 1,
    // borderRadius: 7,
    // borderColor: '#CBC8CD',
    padding: 10,
    marginBottom: 30,
  },
  strategy: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
    marginTop: 20,
  },

});
