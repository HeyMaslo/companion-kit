import Images from 'src/constants/images';
import Colors from 'src/constants/colors/Colors';
import { StyleProp, ViewStyle} from 'react-native';
import React from 'react';
import { DomainName } from 'src/constants/Domain';

export function iconForDomain(domainName: DomainName, style?: StyleProp<ViewStyle>, color: string = Colors.typography.h1, width: number = 30, height: number = 30): JSX.Element {
  if (!domainName) {return <></>;}

    switch (domainName) {
      case DomainName.MOOD:    
      return <Images.moodIcon key={DomainName.MOOD} color={color} width={width} height={height} style={style}/>;
        break;
      case DomainName.PHYSICAL:
        return <Images.physicalIcon key={DomainName.PHYSICAL} color={color} width={width} height={height} style={style}/>;
        break;
      case DomainName.SLEEP:
        return <Images.sleepIcon key={DomainName.SLEEP} color={color} width={width} height={height} style={style}/>;
        break;
      case DomainName.THINKING:
        return <Images.thinkingIcon key={DomainName.THINKING} color={color} width={width} height={height} style={style}/>;
        break;
      case DomainName.IDENTITY:
        return <Images.identityIcon key={DomainName.IDENTITY} color={color} width={width} height={height} style={style}/>;
        break;
      case DomainName.LEISURE:
        return <Images.leisureIcon key={DomainName.LEISURE} color={color} width={width} height={height} style={style}/>;
        break;
      case DomainName.INDEPENDENCE:
        return <Images.independenceIcon key={DomainName.INDEPENDENCE} color={color} width={width} height={height} style={style}/>;
        break;
      case DomainName.SELFESTEEM:
        return <Images.selfEsteemIcon key={DomainName.SELFESTEEM} color={color} width={width} height={height} style={style}/>;
        break;
      case DomainName.HOME:
        return <Images.homeDomainIcon key={DomainName.HOME} color={color} width={width} height={height} style={style}/>;
        break;
      case DomainName.MONEY:
        return <Images.moneyIcon key={DomainName.MONEY} color={color} width={width} height={height} style={style}/>;
        break;
      case DomainName.SPIRITUAL:
        return <Images.spirtualIcon key={DomainName.SPIRITUAL} color={color} width={width} height={height} style={style}/>;
        break;
      case DomainName.RELATIONSHIPS:
        return <Images.relationshipsIcon key={DomainName.RELATIONSHIPS} color={color} width={width} height={height} style={style}/>;
        break;
    }
}