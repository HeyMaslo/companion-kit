import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, View, Text } from 'react-native';
import { Container, ButtonBlock, Button } from 'src/components';
import TextStyles from 'src/styles/TextStyles';
import Colors from 'src/constants/colors';
import PromptModalViewModel from 'common/viewModels/PromptModalViewModel';
import { notch } from 'src/styles/BaseStyles';
import ModalImages from 'src/constants/ModalImages';
import { Theme } from 'src/constants/theme/PStheme';

// import MagicIcon from 'src/assets/images/magic-icon.svg';

interface PromptModalProps {
    style?: any;
    messageStyle?: any;
    model: PromptModalViewModel,
    theme: Theme,
}

@observer
export default class PromptModal extends React.Component<PromptModalProps> {

    get model() { return this.props.model; }

    render() {
        const { style, model, messageStyle } = this.props;

        if (!model.isActive) {
            return null;
        }

        const { modalImage, confirmText, rejectText, title, message, customView } = model.currentAction;
        const Img = ModalImages[modalImage];

        return (
            <View style={[styles.modal, style]}>
                <Container style={styles.container}>
                    <View style={styles.content}>
                        <View style={styles.messageWrap}>
                            {Img ? <Img height="110" width="150" /> : null}
                            <Text style={[TextStyles.h1, styles.title]}>{title}</Text>
                            {typeof message === 'string'
                                ? <Text style={[TextStyles.p1, styles.message, messageStyle]}>{message}</Text>
                                : message}

                            {customView}
                        </View>

                        {rejectText ?
                            <ButtonBlock
                                okTitle={confirmText}
                                cancelTitle={rejectText}
                                onOk={this.model.onConfirm}
                                onCancel={this.model.onReject}
                                containerStyles={styles.actionsWrap}
                                theme={this.props.theme}
                            /> :
                            <View>
                                <Button
                                    title={confirmText}
                                    onPress={this.model.onConfirm}
                                    theme={this.props.theme}
                                />
                                <Text
                                    style={TextStyles.btnTitle}
                                    onPress={this.model.onReject}
                                >
                                    {rejectText}
                                </Text>
                            </View>}
                        <ButtonBlock
                            okTitle={confirmText}
                            cancelTitle={rejectText}
                            onOk={this.model.onConfirm}
                            onCancel={this.model.onReject}
                            containerStyles={styles.actionsWrap}
                            theme={this.props.theme}
                        />
                    </View>
                </Container>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    modal: {
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 100,
        width: '100%',
        height: '100%',
        backgroundColor: Colors.promptModalBg,
        justifyContent: 'flex-start',
        paddingBottom: notch ? 34 : 20,
    },
    container: {
        paddingLeft: 20,
        paddingRight: 20,
    },
    content: {
        width: '100%',
        height: '100%',
    },
    messageWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionsWrap: {
        flex: 0,
        paddingLeft: 0,
        paddingRight: 0,
    },
    message: {
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'center',
        color: Colors.promptModalMessage,
        maxWidth: '100%',
        marginTop: 12,
        marginBottom: 24,
    },
    title: {
        color: Colors.promptModalTitle,
        textAlign: 'center',
        marginTop: 37,
    },
});
