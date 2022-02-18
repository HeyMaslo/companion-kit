import { Platform, StyleSheet } from 'react-native';
import Layout from 'src/constants/Layout';
import TextStylesBase from './TextStyles';

export const TextStyles = TextStylesBase;

export const layout = Layout;

const BaseStyles = StyleSheet.create({
    top43: {
        paddingTop: layout.getViewHeight(43),
    },
    top43FixedHeight: {
        height: layout.getViewHeight(57),
        // paddingBottom: notch && !android ? 34 : 20,
        paddingBottom: 20,
    },
    page: {
        height: layout.window.height,
        justifyContent: 'flex-end',
    },
    container: {
        paddingTop: 20,
        paddingBottom: Platform.OS == 'ios' ? 34 : 20,
    },
    flexStart: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    flexCenter: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    flexBetween: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    flexRowBetween: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    flexCenterTop: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    flexCenterBottom: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    modalView: {
        width: '100%',
        flex: 1,
        height: '100%',
    },
    buttonsBlock: {
        flex: 0,
        width: '100%',
        flexDirection: 'row',
        height: 'auto',
        alignContent: 'flex-start',
        justifyContent: 'space-between',
        paddingLeft: 0,
        paddingRight: 0,
        flexWrap: 'nowrap',
    },
    textBlock: {
        width: '100%',
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    blockButtonsWidth: {
        width: layout.getViewWidth(42.8),
    },
    close: {
        position: 'absolute',
        zIndex: 10,
        elevation: 10,
        top: 4,
        right: 12,
        height: 60,
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    back: {
        position: 'absolute',
        width: 60,
        height: 60,
        top: 4,
        left: 12,
        zIndex: 10,
        elevation: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activity: {
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 100,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
    },
    // card styles
    card: {
        width: '100%',
        height: 74,
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 16,
    },
    cardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%',
        paddingLeft: 16,
        paddingRight: 20,
    },
    cardTitle: {
        ...TextStyles.p2,
        lineHeight: 24,
    },
});

export default BaseStyles;