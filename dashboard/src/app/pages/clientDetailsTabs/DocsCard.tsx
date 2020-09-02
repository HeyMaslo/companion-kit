import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, Image, Button } from 'app/common/components';
import { InputObservable } from 'app/common/components/Input';
import { DocumentItem } from 'app/viewModels/DocsPage';
import { DocumentPresentationType } from 'common/models/FileMeta';
import DropdownList from 'app/common/components/DropdownList';
import DropdownViewModel from 'app/viewModels/components/DropdownViewModel';
import Modal, { ModalAgent } from 'app/components/Modal';
import DocsFormVM from 'app/viewModels/components/DocsFormViewModel';
import ProjectImages from 'app/helpers/images';

import CheckIcon from 'assets/img/check-gray.svg';
import EyeIcon from 'assets/img/eye-icon.svg';
import CrossIcon from 'assets/img/cross-gray.svg';
import { DocumentLinkShareStatuses } from 'common/models';

const IconsByType: Record<DocumentPresentationType, string> = {
    [DocumentPresentationType.document]: ProjectImages.docIconDoc,
    [DocumentPresentationType.media]: ProjectImages.docIconMedia,
    [DocumentPresentationType.image]: ProjectImages.docIconImage,
    [DocumentPresentationType.link]: ProjectImages.docIconLink,
    [DocumentPresentationType.other]: ProjectImages.docIconOther,
};

interface DocsCardProps {
    model: DocumentItem,
    docId: string,
    className?: string,
    form: DocsFormVM,
}

type State = {
    modalActive: boolean,
};

@observer
export default class DocsCard extends React.Component<DocsCardProps, State> {

    dropdownRef = React.createRef<DropdownList>();

    state = {
        modalActive: false,
    };

    readonly dropdownVM = new DropdownViewModel();

    getModalContent = () => {
        const { form, model } = this.props;

        return (
            <Modal
                title={model.type === DocumentPresentationType.link ? 'Rename link' : 'Rename doc'}
                okTitle="save changes"
                cancelTitle="Cancel"
                onOk={this.save}
                onCancel={this.cancel}
                onLayerClick={null}
                disabled={form.loading}
            >
                <InputObservable
                    model={form.docName}
                    errorMessage={form.error}
                    label="name"
                    className="name"
                />
            </Modal>
        );
    }

    cancel = () => {
        const { form } = this.props;
        form.documentId = null;

        this.closeModal();
    }

    save = async () => {
        const { form } = this.props;
        const res = await form.submit();
        if (res) {
            this.closeModal();
        }
    }

    openModal = () => {
        const { model, form } = this.props;
        form.documentId = model.id;
        form.docName.value = model.name;

        this.setState({ modalActive: true });
    }

    closeModal = () => {
        this.setState({ modalActive: false });
        this.props.form.reset();
    }

    onClick = (cb: () => void) => {
        this.dropdownRef.current?.closeDropdown();
        cb();
    }

    getLinkStatusImage = (status: DocumentLinkShareStatuses | 'expired') => {
        let LinkStatusImage;

        switch (status) {
                case DocumentLinkShareStatuses.Sent:
                    LinkStatusImage = CheckIcon;
                    break;

                case DocumentLinkShareStatuses.Opened:
                    LinkStatusImage = EyeIcon;
                    break;

                case 'expired':
                    LinkStatusImage = CrossIcon;
                    break;

                default:
                    LinkStatusImage = '';
        }

        return LinkStatusImage;
    }

    getDropdownList = (type: DocumentPresentationType) => {
        const dropdownList = [
            <Button
                className="btn-action"
                titleClassName="label-dropdown3 "
                title="Rename"
                onClick={() => this.onClick(this.openModal)}
            />,
            <Button
                className="btn-action"
                titleClassName="label-dropdown3 "
                title={type === DocumentPresentationType.link ? 'Open link' : 'Download'}
                onClick={() => this.onClick(this.props.model.downloadDocument)}
            />,
            <Button
                className="btn-action"
                titleClassName="label-dropdown3 type2"
                title="Remove"
                onClick={() => this.onClick(this.props.model.removeDocument)}
            />,
        ];

        if (type === DocumentPresentationType.link) {
            const StatusButton = <Button
                className="btn-action"
                titleClassName="label-dropdown3"
                title={this.props.model.shareAction}
                onClick={() => this.onClick(this.props.model.doShareLinkDocument)}
            />;
            dropdownList.splice(2, 0, StatusButton);
        }

        return dropdownList;
    }

    render() {
        const { model, className } = this.props;
        const { name, type, extension } = model;
        const { modalActive } = this.state;

        const status = model.shareStatus;
        const statusText = model.shareStatusText;

        return (
            <View className={`docs-card ${className || ''}`}>
                {
                    type === DocumentPresentationType.link &&
                    <View className="link-status-wrap">
                        <Image
                            src={this.getLinkStatusImage(status)}
                        />
                        <Text className="tooltip-message type1">{statusText}</Text>
                    </View>
                }
                <View className="icon-wrap">
                    <Image
                        className="icon"
                        src={IconsByType[type || DocumentPresentationType.other]}
                    />
                </View>
                <Text className="doc-name desc-3 type1"> {name} </Text>
                <Text className="doc-extension desc-3 type4"> {extension} </Text>
                <DropdownList
                    model={this.dropdownVM}
                    buttonClassname="desc-1"
                    classNameItem="dropdown-item"
                    buttonLabelValue="..."
                    ref={this.dropdownRef}
                    items={this.getDropdownList(type)}
                />
                {modalActive && (
                    <ModalAgent>
                        {this.getModalContent()}
                    </ModalAgent>
                )}
            </View>
        );
    }
}
