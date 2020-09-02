import React from 'react';
import { observer } from 'mobx-react';
import { View, Page, Text, Image } from 'app/common/components';
import Placeholder from 'app/components/PlaceHolder';
import Localization from 'app/services/localization';
import TimeTrackingViewModel, { TimeTrackingListItem } from 'app/viewModels/TimeTracking/TimeTrackingViewModel';
import Select from 'app/common/components/Select';
import Modal, { ModalAgent } from 'app/components/Modal';
import ProjectImages from 'app/helpers/images';

import TimeTrackingItem from './TimeTrackingItem';
import { InputObservable } from 'app/common/components/Input';
import { DatePickerObservable } from 'app/components/DatePicker.Loader';
import { CheckboxObservable } from 'app/common/components/Checkbox';
import logger from 'common/logger';

type TimeTrackingProps = {
    model: TimeTrackingViewModel;
};

type State = {
    modalActive: boolean,
    isEditMode: boolean,
};

@observer
export default class TimeTracking extends React.Component<TimeTrackingProps, State> {
    get model() { return this.props.model; }

    state = {
        modalActive: false,
        isEditMode: false,
    };

    componentWillUnmount() {
        this.model.dispose();
    }

    getModalContent = () => {
        const { form } = this.model;

        return (
            <Modal
                title={!this.state.isEditMode ? 'Time tracking' : 'Edit entry'}
                okTitle={!this.state.isEditMode ? 'Add time' : 'Save entry'}
                cancelTitle="Cancel"
                onOk={this.save}
                onCancel={this.cancel}
                onLayerClick={null}
                disabled={form.loading}
                className="prompts-modal timetracking-modal"
            >
                <View className="row">
                    <DatePickerObservable
                        model={this.model.form.date}
                        label="Date"
                        className="datepicker"
                        required
                    />
                </View>
                <View className="row">
                    <Select
                        model={this.model.form.activity}
                        label="Activity"
                        classNameWrapper="select-wrap-activity"
                        className="select-type2"
                        buttonClassname="label-dropdown2"
                    />
                    <Select
                        model={this.model.form.diagnosis}
                        label={
                            <>
                                <Text>Diagnosis &nbsp;</Text>
                                <Text className="sub-label">optional</Text>
                            </>
                        }
                        classNameWrapper="select-wrap-diagnosis"
                        className="select-type2"
                        buttonClassname="label-dropdown2"
                        placeholder="-"
                    />
                    <InputObservable
                        model={this.model.form.minutes}
                        errorMessage={this.model.form.minutes.error}
                        type="number"
                        label="Minutes"
                        className="minutes-input"
                        maxLength={2}
                        min={0}
                        max={60}
                    />
                </View>
                <View className="row">
                    <InputObservable
                        model={this.model.form.notes}
                        errorMessage={this.model.form.notes.error}
                        label={
                            <>
                                <Text>Notes &nbsp;</Text>
                                <Text className="sub-label">optional</Text>
                            </>
                        }
                        placeholder="Your notes"
                        className="notes-input"
                        maxLength={500}
                        hasCounter={true}
                    />
                </View>
                <View className="row">
                    <CheckboxObservable
                        model={this.model.form.billable}
                        label="Billable"
                    />
                </View>
            </Modal>
        );
    }

    cancel = () => {
        const { form } = this.model;
        form.id = null;

        this.closeModal();
    }

    save = async () => {
        const { form } = this.model;
        const res = await form.submit();
        if (res) {
            this.closeModal();
        }
    }

    openModal = (item?: TimeTrackingListItem) => {
        if (item) {
            this.model.form.fillForm(item);
            this.setState({modalActive: true, isEditMode: true });
        } else {
            this.setState({ modalActive: true, isEditMode: false });
        }
    }

    closeModal = () => {
        this.setState({ modalActive: false, isEditMode: false });
        this.model.form.reset();
    }

    render() {
        const { modalActive } = this.state;
        const { loading } = this.model;

        return (
            <Page inProgress={loading} className="timetracking-wrap">
                <View className="timetracking-tab">
                    <View className="actions-block">
                        <View onClick={() => this.openModal()} className="add-button">
                            <Image src={ProjectImages.iconAddLink}/>
                            <Text className="label-draganddrop">Add time</Text>
                        </View>
                        {modalActive && (
                            <ModalAgent>
                                {this.getModalContent()}
                            </ModalAgent>
                        )}
                    </View>
                    {
                        !this.model.list.length ?
                        <Placeholder
                            className="timetracking-empty"
                            title={`You don’t have any entries`}
                            description={`Let’s add your first one!`}
                            visual={ProjectImages.TimeTrackingEmptyVisual}
                        />
                        :
                        <View className="timetracking-list">
                            <View className="timetracking-list-header row">
                                <View className="label-btn2 type1 column column-1">Date</View>
                                <View className="label-btn2 type1 column column-2">Activity</View>
                                <View className="label-btn2 type1 column column-3">Diagnosis</View>
                                <View className="label-btn2 type1 column column-4">time</View>
                                <View className="label-btn2 type1 column column-5">Notes</View>
                                <View className="label-btn2 type1 column column-6">Billable</View>
                            </View>
                            {
                                this.model.list.map((item, id) => {
                                    return (
                                        <TimeTrackingItem
                                            key={id}
                                            item={item}
                                            form={this.model.form}
                                            model={this.model}
                                            cb={this.openModal}
                                        />
                                    );
                                })
                            }
                        </View>
                    }
                </View>
            </Page>
        );
    }
}
