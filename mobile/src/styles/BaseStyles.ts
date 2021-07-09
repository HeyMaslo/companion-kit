import { StyleSheet, Platform } from 'react-native';
import Colors from 'src/constants/colors';
// import { hasNotch } from 'src/constants/devices';
import Layout from 'src/constants/Layout';
import TextStylesBase, { mainFontLight, mainFontMedium, mainFontThin } from './TextStyles';

export const TextStyles = TextStylesBase;
// export const notch = hasNotch();
const notch = true;
export const layout = Layout;
const android = Platform.OS === 'android';

const BaseStyles = StyleSheet.create({
    top25: {
        paddingTop: layout.getViewHeight(25),
    },
    top25FixedHeight: {
        height: layout.getViewHeight(75),
        paddingBottom: notch && !android ? 34 : 20,
    },
    top43: {
        paddingTop: layout.getViewHeight(43),
    },
    top43FixedHeight: {
        height: layout.getViewHeight(57),
        paddingBottom: notch && !android ? 34 : 20,
    },
    top51: {
        paddingTop: layout.getViewHeight(51),
    },
    top51FixedHeight: {
        height: layout.getViewHeight(49),
        paddingBottom: notch && !android ? 34 : 20,
    },
    page: {
        backgroundColor: Colors.pageBg,
        height: layout.window.height,
        justifyContent: 'flex-end',
    },
    container: {
        paddingTop: 20,
        paddingBottom: notch && !android ? 34 : 20,
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
        top: 2,
        right: 12,
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    back: {
        position: 'absolute',
        width: 44,
        height: 44,
        top: 2,
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
    textCenter: {
        textAlign: 'center',
    },
    // card styles
    card: {
        width: '100%',
        height: 74,
        borderColor: Colors.borderColor,
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
    cardImage: {
        marginRight: 16,
    },
    cardTextBlock: {
        flex: 1,
    },
    cardTitle: {
        ...TextStyles.p2,
        lineHeight: 24,
        marginBottom: 2,
        color: Colors.card.title,
    },
});

export default BaseStyles;