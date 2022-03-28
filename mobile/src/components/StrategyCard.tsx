import { DisplayStrategy } from '../../../mobile/src/constants/Strategy';
import React from 'react';
import { Dimensions, Pressable, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Images from 'src/constants/images';
import TextStyles from 'src/styles/TextStyles';
import Colors from '../constants/colors/Colors';
import { Theme } from 'src/constants/theme/PStheme';
import { strategyIllustrationForSlug } from 'src/helpers/StrategyHelper';

type IStrategyCardProps = {
  item: DisplayStrategy,
  onLearnMorePress: ((slug: string) => void),
  onSelectStrategy?: ((slug: string) => void),
  hideCheckbox?: boolean,
  isSmallCard?: boolean,
  theme: Theme,
}

type StrategyCardState = { isPressable: boolean }

export default class StrategyCard extends React.Component<IStrategyCardProps, StrategyCardState> {

  constructor(props) {
    super(props);

    this.state = {
      isPressable: !!this.props.onSelectStrategy
    }
  }

  render() {
    const theme = this.props.theme;
    const slug = this.props.item.slug;
    return (
      <Pressable style={{ width: '100%' }} onPress={() => this.props.onSelectStrategy(slug)} disabled={!this.state.isPressable}>
        <View style={[styles.listItem, { backgroundColor: this.props.theme.colors.background }, this.props.item.isChecked && { borderColor: theme.colors.highlight }]}>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Title */}
            <Text style={[TextStyles.labelMedium, { fontSize: 14, display: 'flex' }]}>
              {this.props.item.title}
            </Text>
            {/* Checkbox */}
            {!this.props.hideCheckbox &&
              <View style={[styles.checkbox, this.props.item.isChecked && { borderWidth: 0, backgroundColor: theme.colors.highlight, }, { display: 'flex' }]}>
                {this.props.item.isChecked && <Images.radioChecked width={8} height={6} />}
              </View>}
          </View>

          {/* Body */}
          <View style={{ flex: 1, flexDirection: 'row', }}>
            {/* Strategy Image */}
            <View style={{ flex: 1, aspectRatio: 1, paddingRight: 15, paddingTop: 15 }}>
              {strategyIllustrationForSlug(slug, '100%', '100%')}
            </View>
            <View style={{ flex: 2.5, flexDirection: 'column' }}>
              {/* Short Description */}
              <Text style={[{ flex: 83 }, TextStyles.p2, { paddingTop: 12, paddingBottom: 15 }]}>
                {this.props.item.shortDescription}
              </Text>
              {/* Learn More Button */}
              <TouchableOpacity onPress={() => this.props.onLearnMorePress(slug)} hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}>
                <Text style={[TextStyles.labelMedium, { fontSize: 14, flex: 17, color: theme.colors.highlight, paddingRight: 7, }]}>{'Learn More >'}</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </Pressable>
    );
  }

}


const checkboxSize = 24;

const styles = StyleSheet.create({
  listItem: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 7,
    borderColor: '#CBC8CD',
    padding: 15,
    marginBottom: 30,
  },
  checkbox: {
    height: checkboxSize,
    width: checkboxSize,
    borderRadius: checkboxSize / 2,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexShrink: 0,
  },
  icon: {
    display: 'flex',
    marginRight: 5,
    height: 20,
    width: 20,
  },

});
