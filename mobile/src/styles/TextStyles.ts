import { StyleSheet } from 'react-native';
import Colors from 'src/constants/colors';

export const mainFontLight = 'Font-Light';
export const mainFontMedium = 'Font-Medium';
export const mainFontThin = 'Font-Thin';

// TODO: Recheck letter spacing values
export const TextStyles = StyleSheet.create({
    h1: {
        fontFamily: mainFontLight,
        fontSize: 32,
        lineHeight: 36,
        color: Colors.typography.h1,
        letterSpacing: -0.4,
    },
    h2: {
        fontFamily: mainFontLight,
        fontSize: 28,
        lineHeight: 31,
        color: Colors.typography.h2,
    },
    h3: {
        fontFamily: mainFontLight,
        fontSize: 24,
        lineHeight: 32,
        color: Colors.typography.h3,
    },
    p1: {
        fontFamily: mainFontLight,
        fontWeight: '300',
        fontSize: 20,
        lineHeight: 28,
        color: Colors.typography.p1,
    },
    p2: {
        fontFamily: mainFontLight,
        fontWeight: '300',
        fontSize: 16,
        lineHeight: 24,
        color: Colors.typography.p2,
    },
    p3: {
        fontFamily: mainFontLight,
        fontWeight: '300',
        fontSize: 14,
        lineHeight: 21,
        color: Colors.typography.p3,
    },
    p4: {
        fontFamily: mainFontLight,
        fontWeight: '300',
        fontSize: 12,
        lineHeight: 18,
        color: Colors.typography.p4,
    },
    btnTitle: {
        fontFamily: mainFontMedium,
        fontWeight: '500',
        fontSize: 14,
        lineHeight: 17,
        letterSpacing: 1.17,
        textTransform: 'uppercase',
        color: Colors.typography.btnTitle,
    },
    labelLarge: {
        fontFamily: mainFontMedium,
        fontWeight: '500',
        fontSize: 15,
        lineHeight: 16,
        letterSpacing: 1.79,
        color: Colors.typography.h1,
        textTransform: 'uppercase',
    },
    labelMedium: {
        fontFamily: mainFontMedium,
        fontWeight: '500',
        fontSize: 12,
        lineHeight: 16,
        letterSpacing: 1.79,
        color: Colors.typography.labelMedium,
        textTransform: 'uppercase',
    },
    labelSmall: {
        fontFamily: mainFontMedium,
        fontWeight: '500',
        fontSize: 10,
        lineHeight: 12,
        letterSpacing: 1.5,
        color: Colors.typography.labelSmall,
    },
});

export default TextStyles;