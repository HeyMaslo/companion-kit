import { StyleSheet } from 'react-native';

export const mainFontLight = 'Font-Light';
export const mainFontMedium = 'Font-Medium';
export const mainFontThin = 'Font-Thin';

export const TextStyles = StyleSheet.create({
    h1: {
        fontFamily: mainFontLight,
        fontSize: 32,
        lineHeight: 36,
    },
    h2: {
        fontFamily: mainFontLight,
        fontSize: 28,
        lineHeight: 31,
    },
    h3: {
        fontFamily: mainFontLight,
        fontSize: 24,
        lineHeight: 32,
    },
    p1: {
        fontFamily: mainFontLight,
        fontWeight: '300',
        fontSize: 20,
        lineHeight: 28,
    },
    p2: {
        fontFamily: mainFontLight,
        fontWeight: '300',
        fontSize: 16,
        lineHeight: 24,
    },
    p3: {
        fontFamily: mainFontLight,
        fontWeight: '300',
        fontSize: 14,
        lineHeight: 21,
    },
    p4: {
        fontFamily: mainFontLight,
        fontWeight: '300',
        fontSize: 12,
        lineHeight: 18,
    },
    btnTitle: {
        fontFamily: mainFontMedium,
        fontWeight: '500',
        fontSize: 14,
        lineHeight: 17,
        letterSpacing: 2.38,
        textTransform: 'uppercase',
    },
    labelExtraLarge: {
        fontFamily: mainFontMedium,
        fontWeight: '500',
        fontSize: 20,
        lineHeight: 21,
        letterSpacing: 1.79,
        textTransform: 'uppercase',
    },
    labelLarge: {
        fontFamily: mainFontMedium,
        fontWeight: '500',
        fontSize: 15,
        lineHeight: 16,
        letterSpacing: 1.79,
        textTransform: 'uppercase',
    },
    labelMedium: {
        fontFamily: mainFontMedium,
        fontSize: 13,
        lineHeight: 16,
        textTransform: 'uppercase',
    },
    labelSmall: {
        fontFamily: mainFontMedium,
        fontWeight: '500',
        fontSize: 10,
        lineHeight: 12,
        letterSpacing: 1.5,
    },
});

export default TextStyles;