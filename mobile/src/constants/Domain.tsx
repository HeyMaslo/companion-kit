import { Identify } from 'common/models';
import Images from 'src/constants/images';
import Colors from 'src/constants/colors/Colors';
import { StyleProp, ViewStyle} from 'react-native';
import React from 'react';


export enum DomainScope {
  GENERAL = 'GENERAL',
  WORK = 'WORK',
  STUDENT = 'STUDENT',
}

export type Domain = {
  scope:      DomainScope,
  position:   number,
  name:       string,
  slug:       string,
  importance: string,     // description of why the domain is important
};

export type DomainIded = Identify<Domain>;

export function iconForDomain(d: string, style?: StyleProp<ViewStyle>, color: string = Colors.typography.h1, width: number = 30, height: number = 30): JSX.Element {
  if (!d) {return <></>;}
  switch (d.toLowerCase()) {
    case 'sleep':
      return <Images.sleepIcon color={color} width={width} height={height} style={style}/>;
    case 'physical':
      return <Images.physicalIcon color={color} width={width} height={height} style={style}/>;
    case 'mood':
      return <Images.selfEsteemIcon color={color} width={width} height={height} style={style}/>;
    case 'cognition':
      return <Images.leisureIcon color={color} width={width} height={height} style={style}/>;
  }
}