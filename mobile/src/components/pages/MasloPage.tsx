import React from 'react';
import { TouchableOpacity, Keyboard } from 'react-native';
import Dots from '../Dots';
import BaseStyles, { layout } from 'src/styles/BaseStyles';
import { safeCall } from 'common/utils/functions';
import Images from 'src/constants/images';
import PageBase, { PageProps } from '../common/Page';
import Container from '../Container';
import { Theme } from 'src/constants/theme/PStheme';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

export type MasloPageExtendedProps = PageProps & {
    withDots?: boolean;
    activeDot?: number;
    dotLength?: number;
    inProgress?: boolean;
    withContainer?: boolean;
    onClose?: () => any;
    onBack?: () => any;
    theme: Theme;
};

function wrapWithKeyboardDismiss(cb: () => any) {
    return () => {
        Keyboard.dismiss();
        safeCall(cb);
    };
}

export default function MasloPageExtended(props: MasloPageExtendedProps) {
    const {
        children,
        withDots,
        activeDot,
        dotLength,
        style,
        withContainer,
        onBack,
        onClose,
        theme,
    } = props;

    const _onClose = onClose && wrapWithKeyboardDismiss(onClose);
    const _onBack = onBack && wrapWithKeyboardDismiss(onBack);

    // These will be used if the corresponding safeAreaInset == 0 (example: iPhone 8 safeAreaInsets are {"bottom": 0, "left": 0, "right": 0, "top": 0})
    const customBottomInset = 15;
    const customTopInset = 10;

    return (
        <PageBase style={[BaseStyles.page, style, { backgroundColor: theme.colors.background }]}>
            {withDots ? <Dots length={dotLength || 0} active={activeDot || 0} /> : null}
            {_onBack ? (
                <TouchableOpacity style={[BaseStyles.back]} onPress={_onBack} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <Images.backIcon width={28} height={14} />
                </TouchableOpacity>
            ) : null}
            {_onClose ? (
                <TouchableOpacity onPress={_onClose} style={BaseStyles.close} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <Images.closeIcon width={15} height={15} />
                </TouchableOpacity>
            ) : null}

            {withContainer ? (
                <Container>
                    {children}
                </Container>
            ) : children}

        </PageBase>

        // <SafeAreaInsetsContext.Consumer>
        //     {(insets) =>
        //         <PageBase style={[BaseStyles.page, style,
        //         {
        //             backgroundColor: theme.colors.background,
        //             // marginBottom: insets.bottom,
        //             // height: layout.window.height - (insets.bottom == 0 ? customBottomInset : insets.bottom) - (insets.top ? insets.top : customTopInset),
        //             // marginTop: (insets.top ? insets.top : customTopInset),
        //             // paddingTop: 20
        //         }]}>
        //             {withDots ? <Dots length={dotLength || 0} active={activeDot || 0} /> : null}
        //             {_onBack ? (
        //                 <TouchableOpacity style={[BaseStyles.back]} onPress={_onBack} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        //                     <Images.backIcon width={28} height={14} color={theme.colors.midground} />
        //                 </TouchableOpacity>
        //             ) : null}
        //             {_onClose ? (
        //                 <TouchableOpacity onPress={_onClose} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        //                     <Images.closeIcon width={15} height={15} color={theme.colors.midground} />
        //                 </TouchableOpacity>
        //             ) : null}

        //             {withContainer ? (
        //                 <Container>
        //                     {children}
        //                 </Container>
        //             ) : children}

        //         </PageBase>
        //     }
        // </SafeAreaInsetsContext.Consumer>
    );
}
