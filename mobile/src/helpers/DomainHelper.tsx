import Images from 'src/constants/images';
import Colors from 'src/constants/colors/Colors';
import { StyleProp, ViewStyle} from 'react-native';
import React from 'react';
import { DomainName } from 'src/constants/Domain';

export function iconForDomain(domainName: DomainName, style?: StyleProp<ViewStyle>, color: string = Colors.typography.h1, width: number = 30, height: number = 30): JSX.Element {
  if (!domainName) {return <></>;}

    switch (domainName) {
      case DomainName.MOOD:    
      return <Images.moodIcon color={color} width={width} height={height} style={style}/>;
        break;
      case DomainName.PHYSICAL:
        return <Images.physicalIcon color={color} width={width} height={height} style={style}/>;
        break;
      case DomainName.SLEEP:
        return <Images.sleepIcon color={color} width={width} height={height} style={style}/>;
        break;
      case DomainName.THINKING:
        return <Images.thinkingIcon color={color} width={width} height={height} style={style}/>;
        break;
      case DomainName.IDENTITY:
        return <Images.identityIcon color={color} width={width} height={height} style={style}/>;
        break;
      case DomainName.LEISURE:
        return <Images.leisureIcon color={color} width={width} height={height} style={style}/>;
        break;
      case DomainName.INDEPENDENCE:
        return <Images.independenceIcon color={color} width={width} height={height} style={style}/>;
        break;
      case DomainName.SELFESTEEM:
        return <Images.selfEsteemIcon color={color} width={width} height={height} style={style}/>;
        break;
      case DomainName.HOME:
        return <Images.homeDomainIcon color={color} width={width} height={height} style={style}/>;
        break;
      case DomainName.MONEY:
        return <Images.moneyIcon color={color} width={width} height={height} style={style}/>;
        break;
      case DomainName.SPIRITUAL:
        return <Images.spirtualIcon color={color} width={width} height={height} style={style}/>;
        break;
      case DomainName.RELATIONSHIPS:
        return <Images.relationshipsIcon color={color} width={width} height={height} style={style}/>;
        break;
    }
}