import { observer } from 'mobx-react';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Button, Container, MasloPage, StrategyCard } from 'src/components';
import TextStyles from 'src/styles/TextStyles';
import AppViewModel from 'src/viewModels';
import Colors from '../../../constants/colors/Colors';
import { ScenarioTriggers } from '../../abstractions';
import { FocusStrategiesView } from './FocusStrategiesView';
import { months } from 'common/utils/dateHelpers';

const date = new Date();
const currentMonth = `${months[date.getMonth()]} ${date.getFullYear()}`;


export class PastWeekStrategiesView extends FocusStrategiesView {

  private weekNum = 1;

  constructor(props) {
    super(props);
  }

  onBack = () => {
    this.trigger(ScenarioTriggers.Cancel);
  }

  renderContent() {
    return (
      <MasloPage style={this.baseStyles.page} onBack={this.onBack}>
        <Container style={[{height: this._contentHeight, paddingTop: 10, paddingBottom: 10, alignItems: 'center',}]}>
        <Text style={[TextStyles.labelMedium, styles.date]}>{currentMonth}</Text>
          {super.renderInnerContent(`Here are your past strategies for Week ${this.weekNum}`)}
       </Container>
      </MasloPage>
  );
  }

}

const styles = StyleSheet.create({ 
date: {
  textTransform: 'uppercase',
  marginBottom: 25,
},
});