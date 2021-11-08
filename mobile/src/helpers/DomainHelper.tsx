import Images from 'src/constants/images';
import Colors from 'src/constants/colors/Colors';
import { StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import { DomainName, SubdomainName } from 'src/constants/Domain';

export function iconForDomain(name: DomainName | SubdomainName, style?: StyleProp<ViewStyle>, color: string = Colors.typography.h1, width: number = 30, height: number = 30): JSX.Element {
  if (!name) { return <></>; }

  switch (name) {
    // Domains
    case DomainName.MOOD:
      return <Images.moodIcon pointerEvents={'none'} key={DomainName.MOOD} color={color} width={width} height={height} style={style} />;

    case DomainName.PHYSICAL:
      return <Images.physicalIcon pointerEvents={'none'} key={DomainName.PHYSICAL} color={color} width={width} height={height} style={style} />;

    case DomainName.SLEEP:
      return <Images.sleepIcon pointerEvents={'none'} key={DomainName.SLEEP} color={color} width={width} height={height} style={style} />;

    case DomainName.THINKING:
      return <Images.thinkingIcon pointerEvents={'none'} key={DomainName.THINKING} color={color} width={width} height={height} style={style} />;

    case DomainName.IDENTITY:
      return <Images.identityIcon pointerEvents={'none'} key={DomainName.IDENTITY} color={color} width={width} height={height} style={style} />;

    case DomainName.LEISURE:
      return <Images.leisureIcon pointerEvents={'none'} key={DomainName.LEISURE} color={color} width={width} height={height} style={style} />;

    case DomainName.INDEPENDENCE:
      return <Images.independenceIcon pointerEvents={'none'} key={DomainName.INDEPENDENCE} color={color} width={width} height={height} style={style} />;

    case DomainName.SELFESTEEM:
      return <Images.selfEsteemIcon pointerEvents={'none'} key={DomainName.SELFESTEEM} color={color} width={width} height={height} style={style} />;

    case DomainName.HOME:
      return <Images.homeDomainIcon pointerEvents={'none'} key={DomainName.HOME} color={color} width={width} height={height} style={style} />;

    case DomainName.MONEY:
      return <Images.moneyIcon pointerEvents={'none'} key={DomainName.MONEY} color={color} width={width} height={height} style={style} />;

    case DomainName.SPIRITUAL:
      return <Images.spirtualIcon pointerEvents={'none'} key={DomainName.SPIRITUAL} color={color} width={width} height={height} style={style} />;

    case DomainName.RELATIONSHIPS:
      return <Images.relationshipsIcon pointerEvents={'none'} key={DomainName.RELATIONSHIPS} color={color} width={width} height={height} style={style} />;

    // Physical Subdomain
    case SubdomainName.EXERCISE:
      return <Images.physicalIcon pointerEvents={'none'} key={SubdomainName.EXERCISE} color={color} width={width} height={height} style={style} />;

    case SubdomainName.DIETNUTRITION:
      return <Images.dietIcon pointerEvents={'none'} key={SubdomainName.DIETNUTRITION} color={color} width={width} height={height} style={style} />;

    case SubdomainName.SEXUALHEALTH:
      return <Images.sexualHealthIcon pointerEvents={'none'} key={SubdomainName.SEXUALHEALTH} color={color} width={width} height={height} style={style} />;

    case SubdomainName.SUBSTANCEUSE:
      return <Images.substanceUseIcon pointerEvents={'none'} key={SubdomainName.SUBSTANCEUSE} color={color} width={width} height={height} style={style} />;
  }
}

export function sum(elements: number[]): number {
  var total = 0;
  for (var i = 0; i < elements.length; i++) {
    total += elements[i];
  }
  return total;
}