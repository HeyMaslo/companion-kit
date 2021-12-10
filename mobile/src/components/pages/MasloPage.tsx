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
        <SafeAreaInsetsContext.Consumer>
            {(insets) =>
                <PageBase style={[{ justifyContent: 'flex-end' }, style,
                {
                    backgroundColor: theme.colors.background,
                    height: layout.window.height - (insets.bottom == 0 ? customBottomInset : insets.bottom) - (insets.top ? insets.top : customTopInset),
                    marginTop: (insets.top ? insets.top : customTopInset),
                    paddingTop: 20
                }]}>
                    {withDots ? <Dots length={dotLength || 0} active={activeDot || 0} /> : null}
                    {_onBack ? (
                        <TouchableOpacity style={[BaseStyles.back]} onPress={_onBack}>
                            <Images.backIcon width={28} height={14} color={theme.colors.midground} />
                        </TouchableOpacity>
                    ) : null}
                    {_onClose ? (
                        <TouchableOpacity onPress={_onClose} style={BaseStyles.close}>
                            <Images.closeIcon width={15} height={15} color={theme.colors.midground} />
                        </TouchableOpacity>
                    ) : null}

                    {withContainer ? (
                        <Container>
                            {children}
                        </Container>
                    ) : children}

                </PageBase>
            }
        </SafeAreaInsetsContext.Consumer>
    );
}
