import { DisplayStrategy } from '../../../mobile/src/constants/Strategy';
import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Images from 'src/constants/images';
import TextStyles from 'src/styles/TextStyles';
import Colors from '../constants/colors/Colors';
import { iconForDomain } from 'src/helpers/DomainHelper';
import { DomainSlug } from 'src/constants/Domain';
import { Theme } from 'src/constants/theme/PStheme';

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
    return (
      <Pressable style={{ width: '100%' }} onPress={() => this.props.onSelectStrategy(this.props.item.slug)} disabled={!this.state.isPressable}>
        <View style={[styles.listItem, { backgroundColor: this.props.theme.colors.background }, this.props.item.isChecked && { borderColor: theme.colors.highlight }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[TextStyles.labelLarge, { display: 'flex' }]}>{this.props.item.title}</Text>
            {!this.props.hideCheckbox &&
              <View style={[styles.checkbox, this.props.item.isChecked && { borderWidth: 0, backgroundColor: theme.colors.highlight, }, { display: 'flex' }]}>
                {this.props.item.isChecked && <Images.radioChecked width={8} height={6} />}
              </View>}
          </View>
          {this.props.isSmallCard && <Text style={[TextStyles.p2, { paddingLeft: 7, paddingTop: 7 }]}>{this.props.item.shortDescription}</Text>}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
              {this.props.item.domains.filter((dom) => dom !== DomainSlug.PHYSICAL).map((slug) => {
                return iconForDomain(slug, null, theme.colors.highlight, 22, 22);
              })}
            </View>
            <TouchableOpacity onPress={() => this.props.onLearnMorePress(this.props.item.slug)} hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}>
              <Text style={[TextStyles.labelMedium, { color: theme.colors.highlight, display: 'flex', paddingRight: 7 }]}>{'Learn More >'}</Text>
            </TouchableOpacity>
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
    paddingTop: 15,
    paddingBottom: 10,
    paddingHorizontal: 20,
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
