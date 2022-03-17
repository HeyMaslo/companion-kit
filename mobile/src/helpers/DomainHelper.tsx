import Images from 'src/constants/images';
import { StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import { DomainName, DomainSlug, SubdomainName } from 'src/constants/Domain';
import { mainFontLight, mainFontMedium } from 'src/styles/TextStyles';

export function convertToDomainSlug(name: DomainName | SubdomainName): DomainSlug {
  switch (name) {
    case DomainName.MOOD:
      return DomainSlug.MOOD;
    case DomainName.PHYSICAL:
      return DomainSlug.PHYSICAL;
    case DomainName.SLEEP:
      return DomainSlug.SLEEP;
    case DomainName.THINKING:
      return DomainSlug.THINKING;
    case DomainName.IDENTITY:
      return DomainSlug.IDENTITY;
    case DomainName.LEISURE:
      return DomainSlug.LEISURE;
    case DomainName.INDEPENDENCE:
      return DomainSlug.INDEPENDENCE;
    case DomainName.SELFESTEEM:
      return DomainSlug.SELFESTEEM;
    case DomainName.HOME:
      return DomainSlug.HOME;
    case DomainName.MONEY:
      return DomainSlug.MONEY;
    case DomainName.SPIRITUALITY:
      return DomainSlug.SPIRITUALITY;
    case DomainName.RELATIONSHIPS:
      return DomainSlug.RELATIONSHIPS;
    case DomainName.WORK:
      return DomainSlug.WORK;
    case DomainName.STUDY:
      return DomainSlug.STUDY;
    case SubdomainName.EXERCISE:
      return DomainSlug.EXERCISE;
    case SubdomainName.DIETNUTRITION:
      return DomainSlug.DIETNUTRITION;
    case SubdomainName.SEXUALHEALTH:
      return DomainSlug.SEXUALHEALTH;
    case SubdomainName.SUBSTANCEUSE:
      return DomainSlug.SUBSTANCEUSE;
  }
}

export function convertToDomainSlugs(names: (DomainName | SubdomainName)[]): DomainSlug[] {
  return names.map((name) => convertToDomainSlug(name));
}

export function convertFromDomainSlug(slug: DomainSlug): (DomainName | SubdomainName) {
  switch (slug) {
    case DomainSlug.MOOD:
      return DomainName.MOOD;
    case DomainSlug.PHYSICAL:
      return DomainName.PHYSICAL;
    case DomainSlug.SLEEP:
      return DomainName.SLEEP;
    case DomainSlug.THINKING:
      return DomainName.THINKING;
    case DomainSlug.IDENTITY:
      return DomainName.IDENTITY;
    case DomainSlug.LEISURE:
      return DomainName.LEISURE;
    case DomainSlug.INDEPENDENCE:
      return DomainName.INDEPENDENCE;
    case DomainSlug.SELFESTEEM:
      return DomainName.SELFESTEEM;
    case DomainSlug.HOME:
      return DomainName.HOME;
    case DomainSlug.MONEY:
      return DomainName.MONEY;
    case DomainSlug.SPIRITUALITY:
      return DomainName.SPIRITUALITY;
    case DomainSlug.RELATIONSHIPS:
      return DomainName.RELATIONSHIPS;
    case DomainSlug.WORK:
      return DomainName.WORK;
    case DomainSlug.STUDY:
      return DomainName.STUDY;
    case DomainSlug.EXERCISE:
      return SubdomainName.EXERCISE;
    case DomainSlug.DIETNUTRITION:
      return SubdomainName.DIETNUTRITION;
    case DomainSlug.SEXUALHEALTH:
      return SubdomainName.SEXUALHEALTH;
    case DomainSlug.SUBSTANCEUSE:
      return SubdomainName.SUBSTANCEUSE;
  }
}

export function convertFromDomainSlugs(slugs: DomainSlug[]): (DomainName | SubdomainName)[] {
  return slugs.map((slug) => convertFromDomainSlug(slug));
}

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

    case DomainName.SPIRITUALITY:
      return <Images.spirtualIcon pointerEvents={'none'} key={DomainName.SPIRITUALITY} color={color} fill={fill} width={width} height={height} style={style} />;

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
