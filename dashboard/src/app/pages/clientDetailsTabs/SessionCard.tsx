import React from 'react';
import { observer } from 'mobx-react';
import AudioCard from './AudioCard';
import { View, Text, Button } from 'app/common/components';
import { InputObservable } from 'app/common/components/Input';
import { SessionItem } from 'app/viewModels/ClientEntryItem';
import Modal, { ModalAgent } from 'app/components/Modal';
import DropdownList from 'app/common/components/DropdownList';
import DropdownViewModel from 'app/viewModels/components/DropdownViewModel';
import { EditSessionForm } from 'app/viewModels/SessionsPage';
import { DatePickerObservable } from 'app/components/DatePicker.Loader';

type Props = {
    model: SessionItem,
    clientId: string;
    form: EditSessionForm,
};

type State = {
    modalActive: boolean,
};

@observer
export default class SessionCard extends AudioCard<Props, State> {
    ddRef = React.createRef();

    state = {
        modalActive: false,
    };

    readonly dropdownVM = new DropdownViewModel();

    private form: EditSessionForm  = this.props.form;

    getModalContent = () => {
        return (
            <Modal
                title="Edit session"
                okTitle="save changes"
                cancelTitle="Cancel"
                onOk={this.submit}
                onCancel={this.cancel}
                onLayerClick={null}
            >
                <View id="edit-session-form">
                    <InputObservable type="text" label="name" model={this.form.nameVM} />
                    <DatePickerObservable model={this.form.dateVM} />
                </View>
            </Modal>
        );
    }

    submit = async () => {
        const res = await this.form.submit();

        if (res && res.ok) {
            this.cancel();
        }
    }

    goToInner = () => {
        this.props.model.goToInner();
    }

    cancel = () => {
        this.form.reset();
        this.closeModal();
    }

    openModal = () => {
        this.form.sessionId = this.props.model.id;
        this.form.nameVM.value = this.props.model.title;
        this.form.dateVM.value = new Date(this.props.model.dateTime);

        this.setState({ modalActive: true });
    }

    closeModal = () => {
        this.setState({ modalActive: false });
    }

    getInfoBlock = () => {
        const { modalActive } = this.state;
        const { model } = this.props;

        return (
            <View className="info-block">
                <Text className="dotters desc-1">...</Text>
                {modalActive && (
                    <ModalAgent>
                        {this.getModalContent()}
                    </ModalAgent>
                )}

                {/* Don't forget to replace this with real component */}
                <DropdownList
                    model={this.dropdownVM}
                    buttonClassname="desc-1"
                    classNameItem="dropdown-item"
                    buttonLabelValue="..."
                    items={[
                        <Button
                            className={`btn-action`}
                            titleClassName="label-dropdown3 "
                            title="Edit"
                            onClick={this.openModal}
                        />,
                        <Button
                            className={`btn-action`}
                            titleClassName="label-dropdown3 "
                            title="Download"
                            onClick={model.downloadSession}
                        />,
                        <Button
                            className={`btn-action`}
                            titleClassName="label-dropdown3 type2"
                            title="Remove"
                            onClick={model.deleteSession}
                        />,
                    ]}
                />
            </View>
        );
    }
}
