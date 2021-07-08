import { DisplayStrategyIded } from '../../../mobile/src/constants/Strategy';
import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Images from 'src/constants/images';
import TextStyles from 'src/styles/TextStyles';
import Colors from '../constants/colors/Colors';
import { iconForDomain } from 'src/helpers/DomainHelper';

const { width } = Dimensions.get('window');
const darkColor = TextStyles.h1.color;

type IStrategyCardProps = {
    item: DisplayStrategyIded,
    onLearnMorePress: ((strategyId: string) => void),
    onSelectStrategy?: ((strategyId: string) => void),
    hideCheckbox?: boolean,
    isSmallCard?: boolean,
}

type StrategyCardState= { isPressable: boolean }

export default class StrategyCard extends React.Component<IStrategyCardProps, StrategyCardState> {

  constructor(props) {
    super(props);

    this.state = {
      isPressable: !!this.props.onSelectStrategy
    }
}

render() {
    return(
      <Pressable onPress={()=>this.props.onSelectStrategy(this.props.item.id)} disabled={!this.state.isPressable}>
        <View style={[styles.listItem, this.props.item.isChecked && {borderColor: darkColor}]}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <Text style={[TextStyles.labelLarge, {display: 'flex', maxWidth: width - size - 70}]}>{this.props.item.title}</Text>
            {!this.props.hideCheckbox && 
              <View style={[styles.checkbox, this.props.item.isChecked && styles.checkboxChecked, {display: 'flex'}]}>
                {this.props.item.isChecked && <Images.radioChecked width={8} height={6} />}
              </View>}
          </View>
        {this.props.isSmallCard ? null : <Text style={[TextStyles.p2, {paddingLeft: 7, paddingTop: 7}]}>{this.props.item.details}</Text>
      }
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start'}}>
              {this.props.item.associatedDomainNames.map((slug) => {
                return iconForDomain(slug, null, darkColor, 22, 22);
              })}
            </View>
            <TouchableOpacity onPress={() => this.props.onLearnMorePress(this.props.item.id)} hitSlop={{top: 10, left: 10, right: 10, bottom: 10}}>
              <Text style={[TextStyles.labelMedium, {color: darkColor, display: 'flex', paddingRight: 7}]}>{'Learn More >'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    );
  }

}


const size = 24;

const styles = StyleSheet.create({ 
  listItem: {
    borderWidth: 1,
    borderRadius: 7,
    borderColor: '#CBC8CD',
    paddingTop: 15,
    paddingBottom: 10,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  checkbox: {
    height: size,
    width: size,
    borderRadius: size / 2,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexShrink: 0,
},
  checkboxChecked: {
    backgroundColor: Colors.radioButton.checkedBg,
    borderWidth: 0,
},
  icon: {
    display: 'flex',
    marginRight: 5,
    height: 20,
    width: 20,
  },

});
