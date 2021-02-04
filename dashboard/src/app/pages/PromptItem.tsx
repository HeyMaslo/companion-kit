import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, Image, Button, SwitchHandler } from 'app/common/components';
import Select from 'app/common/components/Select';
import PromptsViewModel, { PromptItemViewModel } from 'app/viewModels/Prompts/PromptsViewModel';
import AddPromptFormVM from 'app/viewModels/Prompts/AddPromptViewModel';
import { ScheduleFormViewModel } from 'app/viewModels/Prompts/SchedulePromptViewModel';
import { InputObservable } from 'app/common/components/Input';
import DropdownList from 'app/common/components/DropdownList';
import DropdownViewModel from 'app/viewModels/components/DropdownViewModel';
import Modal, { ModalAgent } from 'app/components/Modal';
import { DatePickerObservable } from 'app/components/DatePicker.Loader';
import TimePickerLoader from 'app/components/TimePicker.Loader';
import logger from 'common/logger';
import { Dashboard as DashboardFeatures } from 'common/constants/features';

interface PromptItemProps {
    item: PromptItemViewModel,
    promptId: string,
    className?: string,
    addForm: AddPromptFormVM,
    scheduleForm: ScheduleFormViewModel,
    model: PromptsViewModel,
    isRecommended: boolean
}

type State = {
    modalActive: boolean,
    isScheduleForm: boolean,
};

@observer
export default class PromptItem extends React.Component<PromptItemProps, State> {

    dropdownRef = React.createRef<DropdownList>();

    state = {
        modalActive: false,
        isScheduleForm: false,
    };

    readonly dropdownVM = new DropdownViewModel();

    getModalContent = () => {
        const { addForm, scheduleForm } = this.props;
        return (
            <>
                {
                    !this.state.isScheduleForm ?
                        <Modal
                            title="Edit prompt"
                            okTitle="Edit prompt"
                            cancelTitle="Cancel"
                            onOk={this.save}
                            onCancel={this.cancel}
                            onLayerClick={null}
                            disabled={addForm.loading}
                            className="prompts-modal"
                        >
                            <InputObservable
                                model={addForm.text}
                                errorMessage={addForm.error}
                                label="Prompt text"
                                placeholder="Enter your prompt"
                                className="prompt-text"
                                maxLength={100}
                                hasCounter={true}
                            />
                            <Select
                                model={addForm.category}
                                label="Select category"
                                className="select-type2 select-category"
                                buttonClassname="label-dropdown2"
                            />
                        </Modal>
                        :
                        <Modal
                            title="Schedule prompt"
                            okTitle="Schedule prompt"
                            cancelTitle="Cancel"
                            onOk={this.save}
                            onCancel={this.cancel}
                            onLayerClick={null}
                            disabled={scheduleForm.loading}
                            className="prompts-modal schedule-prompt"
                        >
                            <DatePickerObservable model={scheduleForm.date} />
                            <TimePickerLoader model={scheduleForm.time} minuteStep={5} />
                        </Modal>
                }
            </>
        );
    }

    cancel = () => {
        const { addForm, scheduleForm } = this.props;
        !this.state.isScheduleForm ? addForm.promptId = null : scheduleForm.promptId = null;

        this.closeModal();
    }

    save = async () => {
        const { addForm, scheduleForm } = this.props;
        let res;
        if (!this.state.isScheduleForm) {
            res = await addForm.submit();
        } else {
            res = await scheduleForm.submit();
        }
        if (res) {
            this.closeModal();
        }
    }

    openModal = (isScheduleForm: boolean) => {
        const { item, model } = this.props;
        model.fillAddForm(item);
        model.fillScheduleForm(item);

        this.setState({
            modalActive: true,
            isScheduleForm,
        });
    }

    closeModal = () => {
        this.setState({
            modalActive: false,
            isScheduleForm: false,
        });
        this.props.addForm.reset();
        this.props.scheduleForm.reset();
    }

    onClick = (cb: () => void) => {
        this.dropdownRef.current?.closeDropdown();
        cb();
    }

    render() {
        const { item, className, isRecommended } = this.props;
        const { modalActive } = this.state;

        const promptClasses = `${isRecommended ? `recommended-line` : `prompt-text`} desc-3 type1`;

        return (
            <View className={`prompt-item ${className || ''}`}>
                <View className="left-block">
                    <SwitchHandler
                        model={item.switchModel}
                        toggleAction={item.toggleActive}
                    />
                    <Text className={promptClasses}> {item.text} </Text>
                </View>
                {
                    isRecommended && DashboardFeatures.UseGPT3Suggestions && 
                        <View className="center-block">
                                <View className={`category-wrap recommendation-bg`}>
                                    <Text className="desc-6">Companion Kit recommends you ask your client this prompt</Text>
                                </View>
                        </View>
                }
                <View className="right-block">
                    {
                        item.category.name &&
                        <View className={`category-wrap ${item.category.style}`}>
                            <Text className="desc-5">{item.category.name}</Text>
                        </View>
                    }
                    <View className="dropdown-wrap">
                        <Text className="dotters desc-1">...</Text>
                        <DropdownList
                            model={this.dropdownVM}
                            buttonClassname="desc-1"
                            classNameItem="dropdown-item"
                            buttonLabelValue="..."
                            ref={this.dropdownRef}
                            items={[
                                <Button
                                    className={`btn-action`}
                                    titleClassName="label-dropdown3 "
                                    title="Edit"
                                    onClick={() => this.onClick(() => this.openModal(false))}
                                />,
                                <Button
                                    className={`btn-action`}
                                    titleClassName="label-dropdown3 "
                                    title="Duplicate"
                                    onClick={() => this.onClick(item.duplicate)}
                                />,
                                <Button
                                    className={`btn-action`}
                                    titleClassName="label-dropdown3 "
                                    title="Schedule"
                                    onClick={() => this.onClick(() => this.openModal(true))}
                                />,
                                <Button
                                    className={`btn-action`}
                                    titleClassName="label-dropdown3 type2"
                                    title="Remove"
                                    onClick={() => this.onClick(item.removePrompt)}
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
    }
}
