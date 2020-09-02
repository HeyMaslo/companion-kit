import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, Image, Button } from 'app/common/components';
import DropdownList from 'app/common/components/DropdownList';
import DropdownViewModel from 'app/viewModels/components/DropdownViewModel';
import Modal, { ModalAgent } from 'app/components/Modal';
import { AppPromptsCategories, PromptsCategoryStyles } from 'common/models/prompts';

import clockIcon from 'assets/img/clock-schedule.svg';
import { ScheduleFormViewModel, ScheduleItemViewModel } from 'app/viewModels/Prompts/SchedulePromptViewModel';
import { DatePickerObservable } from 'app/components/DatePicker.Loader';
import TimePickerLoader from 'app/components/TimePicker.Loader';

type MockSchedule= {
    date: string,
    text: string,
    time: string,
    id: string,
    category: {
        id: AppPromptsCategories.Types,
        name: string,
        style: PromptsCategoryStyles,
    },
};

interface ScheduleItemProps {
    item: {date: string, items: ReadonlyArray<MockSchedule>},
    className?: string,
    scheduleForm: ScheduleFormViewModel,
    // form: AddPromptFormVM,
    // model: ScheduleViewModel,
}

type State = {
    modalActive: boolean,
};

@observer
export default class ScheduleItem extends React.Component<ScheduleItemProps, State> {

    dropdownRef = React.createRef<DropdownList>();

    state = {
        modalActive: false,
    };

    // readonly dropdownVM = new DropdownViewModel();

    getModalContent = () => {
        const { scheduleForm } = this.props;
        return (
            <Modal
                title="Reschedule prompt"
                okTitle="Reschedule prompt"
                cancelTitle="Cancel"
                onOk={this.save}
                onCancel={this.cancel}
                onLayerClick={null}
                disabled={scheduleForm.loading}
                className="prompts-modal schedule-prompt"
            >
                <DatePickerObservable model={scheduleForm.date} />
                <TimePickerLoader model={scheduleForm.time}/>
            </Modal>
        );
    }

    cancel = () => {
        const { scheduleForm } = this.props;
        scheduleForm.promptId = null;
        scheduleForm.eventId = null;

        this.closeModal();
    }

    save = async () => {
        const { scheduleForm } = this.props;
        const res = await scheduleForm.submit();
        if (res) {
            this.closeModal();
        }
    }

    openModal = (item: ScheduleItemViewModel) => {
        const { scheduleForm } = this.props;
        scheduleForm.fillForm(item);

        this.setState({ modalActive: true });
    }

    closeModal = () => {
        const { scheduleForm } = this.props;

        this.setState({ modalActive: false });
        scheduleForm.reset();
    }

    onClick = (cb: () => void) => {
        this.dropdownRef.current?.closeDropdown();
        cb();
    }

    render() {
        const { item, className } = this.props;
        const { modalActive } = this.state;

        return (
            <View className={`schedule-item-wrap ${className || ''}`}>
                <Text className="schedule-date label-draganddrop">{item.date}</Text>
                {
                    item.items.map((scheduleItem: ScheduleItemViewModel) => {
                        const dropdownVM = new DropdownViewModel();

                        return (
                            <View className="schedule-item" key={scheduleItem.id}>
                                <View className="left-block">
                                    <Text className="schedule-text desc-3 type1"> {scheduleItem.text} </Text>
                                    <View className="time-wrap">
                                        <Image
                                            src={clockIcon}
                                        />
                                        <Text className="desc-3 type4">{scheduleItem.time}</Text>
                                    </View>
                                </View>
                                <View className="right-block">
                                    {
                                        scheduleItem.category.name &&
                                        <View className={`category-wrap ${scheduleItem.category.style}`}>
                                            <Text className="desc-5">{scheduleItem.category.name}</Text>
                                        </View>
                                    }
                                    <View className="dropdown-wrap">
                                        <Text className="dotters desc-1">...</Text>
                                        <DropdownList
                                            model={dropdownVM}
                                            buttonClassname="desc-1"
                                            classNameItem="dropdown-item"
                                            buttonLabelValue="..."
                                            ref={this.dropdownRef}
                                            items={[
                                                <Button
                                                    className={`btn-action`}
                                                    titleClassName="label-dropdown3 "
                                                    title="Reschedule"
                                                    onClick={() => this.onClick(() => this.openModal(scheduleItem))}
                                                />,
                                                <Button
                                                    className={`btn-action`}
                                                    titleClassName="label-dropdown3 "
                                                    title="Duplicate"
                                                    onClick={() => this.onClick(scheduleItem.duplicate)}
                                                />,
                                                <Button
                                                    className={`btn-action`}
                                                    titleClassName="label-dropdown3 type2"
                                                    title="Unschedule"
                                                    onClick={() => this.onClick(scheduleItem.unschedulePrompt)}
                                                />,
                                            ]}
                                            />
                                        {modalActive && (
                                            <ModalAgent>
                                                {this.getModalContent()}
                                            </ModalAgent>
                                        )}
                                    </View>
                                </View>
                            </View>
                        );
                    })
                }
            </View>
        );
    }
}
