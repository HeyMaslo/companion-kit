import { StrategyIded } from '../../../../../mobile/src/constants/Strategy';
import { observer } from 'mobx-react';
import React from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import { Container, MasloPage } from 'src/components';
import TextStyles from 'src/styles/TextStyles';
import AppViewModel from 'src/viewModels';
import { ScenarioTriggers } from '../../abstractions';
import { ViewState } from '../base';
import { iconForDomain } from 'src/helpers/DomainHelper';

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

     onBack = () => {
        this.trigger(ScenarioTriggers.Back);
    }

    private capitalizeFirstLetter(str: string) {
      return str.charAt(0).toLocaleUpperCase() + str.slice(1).toLocaleLowerCase();
    }

    renderIconItem = ({ item }) => (
        <View style={[styles.listItem, {flexDirection: "row", justifyContent: 'center'}]}>
          {iconForDomain(item, {display: 'flex', marginRight: 20})}
          <Text style={[TextStyles.h2, styles.strategy, {display: 'flex'}]}>{this.capitalizeFirstLetter(item)}</Text>
        </View>
    );

    renderContent() {
        return (
            <MasloPage style={this.baseStyles.page} onBack={() => this.onBack()}>
                <Container style={[{height: this._contentHeight, paddingTop: 10, paddingBottom: 10}]}>
                    {/* Title */}
                    <View style={{justifyContent: 'center', flexDirection: 'row', marginBottom: 20}}>
                        <Text style={[TextStyles.h2, styles.strategy]}>{this._learnMoreStrategy.title}</Text>
                    </View>
                    {/* Subtitle */}
                    <Text style={[TextStyles.p2, styles.strategy]}>{'This strategy targets personal improvement in these life domains:'}</Text>
                    {/* Icon Container */}
                    <FlatList style={styles.list}    
                    data={this.viewModel.learnMoreStrategy.associatedDomainNames}
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

const styles = StyleSheet.create({ 
  list: {
    flexGrow: 0,
    marginTop: 50,
  },
  listItem: {
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
