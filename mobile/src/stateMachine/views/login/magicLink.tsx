import { ButtonContext } from 'src/components';
import * as Links from 'src/constants/links';

import { ViewState } from '../base';
import { ModalProps } from '../modalView';
import { safeCall } from 'common/utils/functions';

export type MagicLinkOptions = {
    title?: string;
    afterOpen?: () => any;
};

export function magicLinkModal(
    view: ViewState,
    tryAgain?: () => any,
    options?: MagicLinkOptions,
): ModalProps {
    return {
        title: options?.title || 'Check your email for a magic link',
        primaryButton: {
            text: 'open an email app',
            action: async () => {
                await Links.tryOpenLink(Links.OpenEmailClient);
                safeCall(options?.afterOpen);
            },
        },
        secondaryButton: {
            customRender: () =>
                ButtonContext({
                    text: 'Didn’t get the message?',
                    buttonText: 'Try Again',
                    onPress: () => {
                        view.hideModal();
                        safeCall(tryAgain);
                    },
                }),
        },
    };
}
