import React from 'react';
import {
    TouchableOpacity,
    Keyboard,
} from 'react-native';

import Dots from '../Dots';
import BaseStyles from 'src/styles/BaseStyles';
import { safeCall } from 'common/utils/functions';
import Images from 'src/constants/images';
import PageBase, { PageProps } from '../common/Page';
import Container from '../Container';
import { Theme } from 'src/constants/theme/PStheme';

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

// function getBgColor(bg: MasloPageExtendedProps['background']) {
//     switch (bg) {
//         case 'light': {
//             return Colors.masloPage.bg;
//         }

//         default: {
//             return Colors.pageBg;
//         }
//     }
// }

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

    return (
        <PageBase style={[BaseStyles.page, style, { backgroundColor: theme.colors.background, }]}>
            {withDots ? <Dots length={dotLength || 0} active={activeDot || 0} /> : null}
            {_onBack ? (
                <TouchableOpacity style={[BaseStyles.back]} onPress={_onBack}>
                    <Images.backIcon width={28} height={14} />
                </TouchableOpacity>
            ) : null}
            {_onClose ? (
                <TouchableOpacity onPress={_onClose} style={BaseStyles.close}>
                    <Images.closeIcon width={15} height={15} />
                </TouchableOpacity>
            ) : null}

            {withContainer ? (
                <Container>
                    {children}
                </Container>
            ) : children}

        </PageBase>
    );
}
