import Images from 'src/constants/images';
import { StyleProp, Text, ViewStyle } from 'react-native';
import React from 'react';
import { DomainName, SubdomainName } from 'src/constants/Domain';
import TextStyles, { mainFontMedium } from 'src/styles/TextStyles';

export function iconForDomain(name: DomainName | SubdomainName, style?: StyleProp<ViewStyle>, color: string = 'black', width: number = 30, height: number = 30, fill?: string): JSX.Element {
  if (!name) { return <></>; }

  switch (name) {
    // Domains
    case DomainName.MOOD:
      return <Images.moodIcon pointerEvents={'none'} key={DomainName.MOOD} color={color} fill={fill} width={width} height={height} style={style} />;

    case DomainName.PHYSICAL:
      if (fill) {
        return <Images.physicalIconFilled pointerEvents={'none'} key={DomainName.PHYSICAL} color={color} fill={fill} width={width} height={height} style={style} />;
      }
      return <Images.physicalIcon pointerEvents={'none'} key={DomainName.PHYSICAL} color={color} width={width} height={height} style={style} />;

    case DomainName.SLEEP:
      return <Images.sleepIcon pointerEvents={'none'} key={DomainName.SLEEP} color={color} fill={fill} width={width} height={height} style={style} />;

    case DomainName.THINKING:
      return <Images.thinkingIcon pointerEvents={'none'} key={DomainName.THINKING} color={color} fill={fill} width={width} height={height} style={style} />;

    case DomainName.IDENTITY:
      return <Images.identityIcon pointerEvents={'none'} key={DomainName.IDENTITY} color={color} fill={fill} width={width} height={height} style={style} />;

    case DomainName.LEISURE:
      return <Images.leisureIcon pointerEvents={'none'} key={DomainName.LEISURE} color={color} fill={fill} width={width} height={height} style={style} />;

    case DomainName.INDEPENDENCE:
      return <Images.independenceIcon pointerEvents={'none'} key={DomainName.INDEPENDENCE} color={color} fill={fill} width={width} height={height} style={style} />;

    case DomainName.SELFESTEEM:
      return <Images.selfEsteemIcon pointerEvents={'none'} key={DomainName.SELFESTEEM} color={color} fill={fill} width={width} height={height} style={style} />;

    case DomainName.HOME:
      return <Images.homeDomainIcon pointerEvents={'none'} key={DomainName.HOME} color={color} fill={fill} width={width} height={height} style={style} />;

    case DomainName.MONEY:
      return <Images.moneyIcon pointerEvents={'none'} key={DomainName.MONEY} color={color} fill={fill} width={width} height={height} style={style} />;

    case DomainName.SPIRITUAL:
      return <Images.spirtualIcon pointerEvents={'none'} key={DomainName.SPIRITUAL} color={color} fill={fill} width={width} height={height} style={style} />;

    case DomainName.RELATIONSHIPS:
      return <Images.relationshipsIcon pointerEvents={'none'} key={DomainName.RELATIONSHIPS} color={color} fill={fill} width={width} height={height} style={style} />;

    // Physical Subdomain
    case SubdomainName.EXERCISE:
      return <Images.physicalIcon pointerEvents={'none'} key={SubdomainName.EXERCISE} color={color} fill={fill} width={width} height={height} style={style} />;

    case SubdomainName.DIETNUTRITION:
      return <Images.dietIcon pointerEvents={'none'} key={SubdomainName.DIETNUTRITION} color={color} fill={fill} width={width} height={height} style={style} />;

    case SubdomainName.SEXUALHEALTH:
      return <Images.sexualHealthIcon pointerEvents={'none'} key={SubdomainName.SEXUALHEALTH} color={color} fill={fill} width={width} height={height} style={style} />;

    case SubdomainName.SUBSTANCEUSE:
      return <Images.substanceUseIcon pointerEvents={'none'} key={SubdomainName.SUBSTANCEUSE} color={color} fill={fill} width={width} height={height} style={style} />;
  }
}

export function sum(elements: number[]): number {
  let total = 0;
  for (let i = 0; i < elements.length; i++) {
    total += elements[i];
  }
  return total;
}

export function formatTextContent(input: string, headingStyle?: any, boldStyle?: any, italicsStyle?: any): (string | JSX.Element)[] {
  const baseBoldStyle: any = {
    fontFamily: mainFontMedium
  }
  const baseItalicsStyleStyle: any = {
    fontFamily: mainFontMedium
  }
  // MK-TODO: - Bulleted and numbered lists, italic font, bold/italic text within a line
  return input.split(/\\n/g).map((str) => {
    str += '\n';
    if (str.startsWith('/h1')) {
      return <Text key={str} style={headingStyle ? headingStyle : TextStyles.h3}>
        {`\n${str.substring(3)}\n`}
      </Text>;
    } else if (str.startsWith('/bbold')) {
      return <Text key={str} style={boldStyle ? boldStyle : baseBoldStyle}>
        {`\n${str.substring(6)}\n`}
      </Text>;
    } else if (str.startsWith('/iitalics')) {
      return <Text key={str} style={italicsStyle ? italicsStyle : baseItalicsStyleStyle}>
        {`\n${str.substring(9)}\n`}
      </Text>;
    }
    return str;
  })
}