import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, Container } from 'app/common/components';
import ButtonColor from 'app/components/ButtonColor';
import PromptModalViewModel from 'common/viewModels/PromptModalViewModel';
import MarkdownView from 'app/components/MarkdownView';

type PromptModalProps = {
    style?: any;
    model: PromptModalViewModel,
};

@observer
export default class PromptModal extends React.Component<PromptModalProps> {
    private readonly _root = document.getElementById('root');
    get model() { return this.props.model; }

    render() {
        const { style, model } = this.props;

        if (!model.isActive) {
            if (this._root) {
                // this._root.classList.remove('modal-active');
            }
            return null;
        }
        if (this._root) {
            // this._root.classList.add('modal-active');
        }

        const { confirmText, rejectText, title, message, className, typeModal } = model.currentAction;

        return (
            <View className={`prompt-modal-wrapper ${typeModal} ${style ? style : ''} ${className ? className : ''}`}>
                <View className="wrapper">
                    <MarkdownView content={title} />
                    <Text className="desc-1">{message}</Text>
                    <View className="action-buttons-wrap">
                        <ButtonColor
                            className="confirm-btn"
                            onClick={this.model.onConfirm}
                            title={confirmText}
                        />
                        { rejectText &&
                            <>
                                <View className="separator"/>
                                <ButtonColor
                                    className="reject-btn"
                                    onClick={this.model.onReject}
                                    title={rejectText}
                                />
                            </>
                        }
                    </View>
                </View>
            </View>
        );
    }
}