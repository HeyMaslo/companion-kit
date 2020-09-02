import React from 'react';
import { Container, View, Image, Text } from '../common/components';
import logger from 'common/logger';

import ProjectImages from 'app/helpers/images';

type ModalProps = {
    isOpen: boolean;
    onClose?: () => void;
    onSubmit?: () => void;
};

export default class EnterpriseModal extends React.Component<ModalProps> {
    _form: HTMLElement = null;
    _formParent: Node['parentNode'] = null;

    componentDidMount() {
        this._form = document.getElementById('mc-embedded-subscribe-form');
        this._formParent = this._form.parentNode;

        if (this._form) {
            document.querySelector('.modal-enterprise-form-wrap').appendChild(this._form);
        }
    }

    private onCloseClick = () => {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    private onSubmitClick = () => {
        if (this.props.onSubmit) {
            this.props.onSubmit();
        }
    }

    componentWillUnmount() {
        if (this._form && this._formParent) {
            this._formParent.appendChild(this._form);
        }
    }

    render() {
        const { isOpen } = this.props;

        return (
            <View className={`modal modal-enterprise ${isOpen ? 'open' : ''}`}>
                <Container className="modal-enterprise-container">
                    <Image onClick={() => this.onCloseClick()} className="back-arrow" src={ProjectImages.backArrow} />
                    <View className="modal-enterprise-header">
                        <Text className="title-h1 modal-enterprise-title">Request a Quote</Text>
                        <Text className="desc-1 modal-enterprise-subtitle">Tell us a bit about your business</Text>
                    </View>
                    <View id="mc_embed_signup" className="modal-enterprise-form-wrap"></View>
                </Container>
            </View>
        );
    }
}
