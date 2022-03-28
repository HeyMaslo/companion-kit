import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Images from 'src/constants/images';

export function strategyIllustrationForSlug(slug: string, height: number | string = 30, width: number | string = 30, style?: StyleProp<ViewStyle>, fill?: string): JSX.Element {
  if (!slug) { return <></> }

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

    default:
      return <></>;
  }
}
