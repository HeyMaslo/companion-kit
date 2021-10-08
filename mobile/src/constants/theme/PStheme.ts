import { StyleSheet } from 'react-native';

export type ThemeState = 'Light' | 'Dark';

const palette = {
  purplePrimary: '#424AA0',
  purpleMuted: '#999DC3',
  purpleLight: '#C4D2F6',

  orangePrimary: '#EF7864',
  orangeLight: '#F7B8AE',

  greyPrimary: '#3E3C43',
  greyLight: '#BBBFBF',
  greyExtraLight: '#E4E4E7',

  black: '#0B0B0B',
  white: '#FFFFFF', //'#F0F2F3',
};


const colors = {
  background: palette.white,
  midground: palette.greyExtraLight,
  foreground: palette.greyPrimary,

  highlight: palette.purplePrimary,
  highlightSecondary: palette.purpleMuted,

  highlightContrast: palette.orangePrimary,
  highlightContrastSecondary: palette.orangeLight,

  tint: palette.purpleLight,

  // cardPrimaryBackground: palette.purplePrimary,
  // buttonPrimaryBackground: palette.purplePrimary,
}

//   spacing: {
//     s: 8,
//     m: 16,
//     l: 24,
//     xl: 40,
//   },
//   breakpoints: {
//     phone: 0,
//     tablet: 768,
//   },
// });

const theme = {
    colors
}

const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
  }
}

const lightStyleSheet = StyleSheet.create({

});

const darkStyleSheet = StyleSheet.create({

});

export default function getStyleSheet(useDarkTheme: ThemeState) {
  return useDarkTheme ? darkStyleSheet : lightStyleSheet;
}

export function getTheme(useDarkTheme: ThemeState) {
  return useDarkTheme == 'Dark' ? darkTheme : theme;
}

export type Theme = typeof theme;

