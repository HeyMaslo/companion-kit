import Images from 'src/constants/images';
import { StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import { DomainSlug } from 'src/constants/Domain';
import { mainFontLight, mainFontMedium } from 'src/styles/TextStyles';

export function iconForDomain(slug: DomainSlug, style?: StyleProp<ViewStyle>, color: string = 'black', width: number = 30, height: number = 30, fill?: string): JSX.Element {
  if (!slug) { return <></>; }

  switch (slug) {
    // Domains
    case DomainSlug.MOOD:
      return <Images.moodIcon pointerEvents={'none'} key={DomainSlug.MOOD} color={color} fill={fill} width={width} height={height} style={style} />;

    case DomainSlug.PHYSICAL:
      if (fill) {
        return <Images.physicalIconFilled pointerEvents={'none'} key={DomainSlug.PHYSICAL} color={color} fill={fill} width={width} height={height} style={style} />;
      }
      return <Images.physicalIcon pointerEvents={'none'} key={DomainSlug.PHYSICAL} color={color} width={width} height={height} style={style} />;

    case DomainSlug.SLEEP:
      return <Images.sleepIcon pointerEvents={'none'} key={DomainSlug.SLEEP} color={color} fill={fill} width={width} height={height} style={style} />;

    case DomainSlug.THINKING:
      return <Images.thinkingIcon pointerEvents={'none'} key={DomainSlug.THINKING} color={color} fill={fill} width={width} height={height} style={style} />;

    case DomainSlug.IDENTITY:
      return <Images.identityIcon pointerEvents={'none'} key={DomainSlug.IDENTITY} color={color} fill={fill} width={width} height={height} style={style} />;

    case DomainSlug.LEISURE:
      return <Images.leisureIcon pointerEvents={'none'} key={DomainSlug.LEISURE} color={color} fill={fill} width={width} height={height} style={style} />;

    case DomainSlug.INDEPENDENCE:
      return <Images.independenceIcon pointerEvents={'none'} key={DomainSlug.INDEPENDENCE} color={color} fill={fill} width={width} height={height} style={style} />;

    case DomainSlug.SELFESTEEM:
      return <Images.selfEsteemIcon pointerEvents={'none'} key={DomainSlug.SELFESTEEM} color={color} fill={fill} width={width} height={height} style={style} />;

    case DomainSlug.HOME:
      return <Images.homeDomainIcon pointerEvents={'none'} key={DomainSlug.HOME} color={color} fill={fill} width={width} height={height} style={style} />;

    case DomainSlug.MONEY:
      return <Images.moneyIcon pointerEvents={'none'} key={DomainSlug.MONEY} color={color} fill={fill} width={width} height={height} style={style} />;

    case DomainSlug.SPIRITUALITY:
      return <Images.spirtualIcon pointerEvents={'none'} key={DomainSlug.SPIRITUALITY} color={color} fill={fill} width={width} height={height} style={style} />;

    case DomainSlug.RELATIONSHIPS:
      return <Images.relationshipsIcon pointerEvents={'none'} key={DomainSlug.RELATIONSHIPS} color={color} fill={fill} width={width} height={height} style={style} />;

    // Physical Subdomain
    case DomainSlug.EXERCISE:
      return <Images.physicalIcon pointerEvents={'none'} key={DomainSlug.EXERCISE} color={color} fill={fill} width={width} height={height} style={style} />;

    case DomainSlug.DIETNUTRITION:
      return <Images.dietIcon pointerEvents={'none'} key={DomainSlug.DIETNUTRITION} color={color} fill={fill} width={width} height={height} style={style} />;

    case DomainSlug.SEXUALHEALTH:
      return <Images.sexualHealthIcon pointerEvents={'none'} key={DomainSlug.SEXUALHEALTH} color={color} fill={fill} width={width} height={height} style={style} />;

    case DomainSlug.SUBSTANCEUSE:
      return <Images.substanceUseIcon pointerEvents={'none'} key={DomainSlug.SUBSTANCEUSE} color={color} fill={fill} width={width} height={height} style={style} />;
  }
}

export function domainTag(slug: DomainSlug, style?: StyleProp<ViewStyle>, color: string = 'black', height: number = 40, fill?: string): JSX.Element {
  if (!slug) { return <></>; }

  switch (slug) {
    // Domains
    case DomainSlug.MOOD:
      return <Images.moodIconTag pointerEvents={'none'} key={DomainSlug.MOOD} color={color} fill={fill} height={height} style={style} />;

    case DomainSlug.PHYSICAL:
      return <Images.physicalIconFilled pointerEvents={'none'} key={DomainSlug.PHYSICAL} color={color} fill={fill} height={height} style={style} />;

    case DomainSlug.SLEEP:
      return <Images.sleepIconTag pointerEvents={'none'} key={DomainSlug.SLEEP} color={color} fill={fill} height={height} style={style} />;

    case DomainSlug.THINKING:
      return <Images.thinkingIconTag pointerEvents={'none'} key={DomainSlug.THINKING} color={color} fill={fill} height={height} style={style} />;

    case DomainSlug.IDENTITY:
      return <Images.identityIconTag pointerEvents={'none'} key={DomainSlug.IDENTITY} color={color} fill={fill} height={height} style={style} />;

    case DomainSlug.LEISURE:
      return <Images.leisureIconTag pointerEvents={'none'} key={DomainSlug.LEISURE} color={color} fill={fill} height={height} style={style} />;

    case DomainSlug.INDEPENDENCE:
      return <Images.independenceIconTag pointerEvents={'none'} key={DomainSlug.INDEPENDENCE} color={color} fill={fill} height={height} style={style} />;

    case DomainSlug.SELFESTEEM:
      return <Images.selfEsteemIconTag pointerEvents={'none'} key={DomainSlug.SELFESTEEM} color={color} fill={fill} height={height} style={style} />;

    case DomainSlug.HOME:
      return <Images.homeDomainIconTag pointerEvents={'none'} key={DomainSlug.HOME} color={color} fill={fill} height={height} style={style} />;

    case DomainSlug.MONEY:
      return <Images.moneyIconTag pointerEvents={'none'} key={DomainSlug.MONEY} color={color} fill={fill} height={height} style={style} />;

    case DomainSlug.SPIRITUALITY:
      return <Images.spirtualIconTag pointerEvents={'none'} key={DomainSlug.SPIRITUALITY} color={color} fill={fill} height={height} style={style} />;

    case DomainSlug.RELATIONSHIPS:
      return <Images.relationshipsIconTag pointerEvents={'none'} key={DomainSlug.RELATIONSHIPS} color={color} fill={fill} height={height} style={style} />;

    // Physical Subdomain
    case DomainSlug.EXERCISE:
      return <Images.physicalIconTag pointerEvents={'none'} key={DomainSlug.EXERCISE} color={color} fill={fill} height={height} style={style} />;

    case DomainSlug.DIETNUTRITION:
      return <Images.dietIconTag pointerEvents={'none'} key={DomainSlug.DIETNUTRITION} color={color} fill={fill} height={height} style={style} />;

    case DomainSlug.SEXUALHEALTH:
      return <Images.sexualHealthIconTag pointerEvents={'none'} key={DomainSlug.SEXUALHEALTH} color={color} fill={fill} height={height} style={style} />;

    case DomainSlug.SUBSTANCEUSE:
      return <Images.substanceUseIconTag pointerEvents={'none'} key={DomainSlug.SUBSTANCEUSE} color={color} fill={fill} height={height} style={style} />;
  }
}

export function sum(elements: number[]): number {
  let total = 0;
  for (let i = 0; i < elements.length; i++) {
    total += elements[i];
  }
  return total;
}

export function replaceListTags(htmlString: string): string {
  let newString = htmlString.replace(new RegExp('<ul>', 'g'), '<p>');
  newString = newString.replace(new RegExp('<li>', 'g'), '• ');
  newString = newString.replace(new RegExp('</li>', 'g'), '<br>');
  newString = newString.replace(new RegExp('<br></ul>', 'g'), '</p>'); // remove the <br> after the last bullet point

  return newString;
}

export const HTMLStyles = {
  baseStyle: { fontFamily: mainFontLight, lineHeight: 30, fontSize: 15 },
  systemFonts: [mainFontLight, mainFontMedium],
  tagsStyles: { h2: { fontFamily: mainFontMedium }, h3: { fontFamily: mainFontMedium }, strong: { fontFamily: mainFontMedium }, em: { fontFamily: mainFontMedium } }
}
