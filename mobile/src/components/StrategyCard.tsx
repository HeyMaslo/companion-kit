import { DisplayStrategy } from '../../../mobile/src/constants/Strategy';
import React from 'react';
import { Dimensions, Pressable, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
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

          {/* {this.props.isSmallCard && <Text style={[TextStyles.p2, { paddingLeft: 7, paddingTop: 7 }]}>{this.props.item.shortDescription}</Text>}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
              {this.props.item.domains.filter((dom) => dom !== DomainSlug.PHYSICAL).map((slug) => {
                return iconForDomain(slug, null, theme.colors.highlight, 22, 22);
              })}
            </View> */}
          {/* <TouchableOpacity onPress={() => this.props.onLearnMorePress(slug)} hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}>
              <Text style={[TextStyles.labelMedium, { color: theme.colors.highlight, display: 'flex', paddingRight: 7 }]}>{'Learn More >'}</Text>
            </TouchableOpacity>
          </View> */}

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


export function strategyIllustrationForSlug(slug: string, height: number | string = 30, width: number | string = 30, style?: StyleProp<ViewStyle>, fill?: string): JSX.Element {
  if (!slug) { return <></>; }

  switch (slug) {
    case 'Balance':
      return <Images.StrategyBalance pointerEvents={'none'} key={'Balance'} height={height} width={width} style={style} />;

    case 'MitigateRiskOrHarm':
      return <Images.StrategyMitigateRiskOrHarm pointerEvents={'none'} key={'MitigateRiskOrHarm'} height={height} width={width} style={style} />;

    case 'BehaviouralActivation':
      return <Images.StrategyBehaviouralActivation pointerEvents={'none'} key={'BehaviouralActivation'} height={height} width={width} style={style} />;

    case 'Monitoring':
      return <Images.StrategyMonitoring pointerEvents={'none'} key={'Monitoring'} height={height} width={width} style={style} />;

    case 'Calendar':
      return <Images.StrategyCalendar pointerEvents={'none'} key={'Calendar'} height={height} width={width} style={style} />;

    case 'SelfCompassion':
      return <Images.StrategySelfCompassion pointerEvents={'none'} key={'SelfCompassion'} height={height} width={width} style={style} />;

    case 'ChallengeNegativeThinking':
      return <Images.StrategyChallengeNegativeThinking pointerEvents={'none'} key={'ChallengeNegativeThinking'} height={height} width={width} style={style} />;

    case 'SetBoundaries':
      return <Images.StrategySetBoundaries pointerEvents={'none'} key={'SetBoundaries'} height={height} width={width} style={style} />;

    case 'GetOrganized':
      return <Images.StrategyGetOrganized pointerEvents={'none'} key={'GetOrganized'} height={height} width={width} style={style} />;

    case 'SettingGoals':
      return <Images.StrategySettingGoals pointerEvents={'none'} key={'SettingGoals'} height={height} width={width} style={style} />;

    case 'JoinASocialLeisureActivity':
      return <Images.StrategyJoinASocialLeisureActivity pointerEvents={'none'} key={'JoinASocialLeisureActivity'} height={height} width={width} style={style} />;

    case 'SlowDown':
      return <Images.StrategySlowDown pointerEvents={'none'} key={'SlowDown'} height={height} width={width} style={style} />;

    case 'Mindfulness':
      return <Images.StrategyMindfulness pointerEvents={'none'} key={'Mindfulness'} height={height} width={width} style={style} />;


  }
}