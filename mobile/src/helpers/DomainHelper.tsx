import Images from 'src/constants/images';
import Colors from 'src/constants/colors/Colors';
import { GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import React from 'react';
import { DomainName } from 'src/constants/Domain';

export function iconForDomain(domainName: DomainName, style?: StyleProp<ViewStyle>, color: string = Colors.typography.h1, width: number = 30, height: number = 30, onPress?: (key: string) => (event: GestureResponderEvent) => void): JSX.Element {
  if (!domainName) {return <></>;}

    switch (domainName) {
      case DomainName.MOOD:    
      return <Images.moodIcon key={DomainName.MOOD} color={color} width={width} height={height} style={style} onPress={onPress ? onPress(DomainName.MOOD): null}/>;
        
      case DomainName.PHYSICAL:
        return <Images.physicalIcon key={DomainName.PHYSICAL} color={color} width={width} height={height} style={style} onPress={onPress ? onPress(DomainName.PHYSICAL): null}/>;
        
      case DomainName.SLEEP:
        return <Images.sleepIcon key={DomainName.SLEEP} color={color} width={width} height={height} style={style} onPress={onPress ? onPress(DomainName.SLEEP): null}/>;
        
      case DomainName.THINKING:
        return <Images.thinkingIcon key={DomainName.THINKING} color={color} width={width} height={height} style={style} onPress={onPress ? onPress(DomainName.THINKING): null}/>
        
      case DomainName.IDENTITY:
        return <Images.identityIcon key={DomainName.IDENTITY} color={color} width={width} height={height} style={style} onPress={onPress ? onPress(DomainName.IDENTITY): null}/>;
        
      case DomainName.LEISURE:
        return <Images.leisureIcon key={DomainName.LEISURE} color={color} width={width} height={height} style={style} onPress={onPress ? onPress(DomainName.LEISURE): null}/>;
        
      case DomainName.INDEPENDENCE:
        return <Images.independenceIcon key={DomainName.INDEPENDENCE} color={color} width={width} height={height} style={style} onPress={onPress ? onPress(DomainName.INDEPENDENCE): null}/>;
        
      case DomainName.SELFESTEEM:
        return <Images.selfEsteemIcon key={DomainName.SELFESTEEM} color={color} width={width} height={height} style={style} onPress={onPress ? onPress(DomainName.SELFESTEEM): null}/>;
        
      case DomainName.HOME:
        return <Images.homeDomainIcon key={DomainName.HOME} color={color} width={width} height={height} style={style} onPress={onPress ? onPress(DomainName.HOME): null}/>;
        
      case DomainName.MONEY:
        return <Images.moneyIcon key={DomainName.MONEY} color={color} width={width} height={height} style={style} onPress={onPress ? onPress(DomainName.MONEY): null}/>;
        
      case DomainName.SPIRITUAL:
        return <Images.spirtualIcon key={DomainName.SPIRITUAL} color={color} width={width} height={height} style={style} onPress={onPress ? onPress(DomainName.SPIRITUAL): null}/>;
        
      case DomainName.RELATIONSHIPS:
        return <Images.relationshipsIcon key={DomainName.RELATIONSHIPS} color={color} width={width} height={height} style={style} onPress={onPress ? onPress(DomainName.RELATIONSHIPS): null}/>;
        
    }
}