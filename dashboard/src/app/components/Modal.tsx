import React from 'react';
import { View, Text, Button, Image } from 'app/common/components';
import ButtonArrow from 'app/components/ButtonArrow';
import logger from 'common/logger';
import closeIcon from 'assets/img/close-icon2.svg';

export function ModalAgent(props: React.PropsWithChildren<{}>): React.ReactElement {

    React.useEffect(() => {
        ModalRenderer.setModalContent(props.children);

        return () => {
            ModalRenderer.clearModalContent();
        };
    }, [props.children]);

    return null;
}

export class ModalRenderer extends React.Component<{}, { content: React.ReactNode }> {

    state = {
        content: null as React.ReactNode,
    };

    private static _instance: ModalRenderer;

    static setModalContent(jsx: React.ReactNode) {
        if (ModalRenderer._instance) {
            ModalRenderer._instance.setState({ content: jsx });
        }
    }

    static clearModalContent() {
        if (ModalRenderer._instance) {
            ModalRenderer._instance.setState({ content: null });
        }
    }

    componentDidMount() {
        ModalRenderer._instance = this;
    }

    componentWillUnmount() {
        ModalRenderer._instance = null;
    }

    render() {
        if (!this.state.content) {
            return null;
        }

        return (
            <>
                {this.state.content}
            </>
        );
    }
}

type Props = {
    title?: string,

    disabled?: boolean;

    okTitle?: string,
    onOk?: () => void,

    cancelTitle?: string,
    onCancel?: () => void,

    onLayerClick?: () => void;
    className?: string;
};

export default function Modal(props: React.PropsWithChildren<Props>) {
    return (
        <View className={`modal-base ${props.className ? props.className : ''}`}>
            <View className="layer" onClick={props.onLayerClick} />
            <View className="content">
                <View className="head-content">
                    <Text className="title title-h2 type5">{props.title}</Text>
                    <Button className="close-cross" onClick={props.onCancel}>
                        <Image
                            src={closeIcon}
                        />
                    </Button>
                </View>

                <View className="inner-content">
                    {props.children}
                </View>

                <View className="buttons">
                    <Button titleClassName="label-btn4 type5" title={props.cancelTitle} onClick={props.onCancel} />
                    <ButtonArrow
                        titleClassName="type4"
                        typeButton="primary"
                        disabled={props.disabled}
                        title={props.okTitle}
                        onClick={props.onOk}
                    />
                </View>
            </View>
        </View>
    );
}
