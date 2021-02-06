import React from 'react';
import { observer } from 'mobx-react';
import { RouteComponentProps } from 'react-router';
import History from 'app/services/history';
import { Page, View, Container, Image, Text, SwitchHandler, RadioButtonsGroup } from 'app/common/components';
import Select from 'app/common/components/Select';
import PromptItem from 'app/pages/PromptItem';
import ScheduleItem from 'app/pages/ScheduleItem';
import Tabs from 'app/components/Tabs';
import ProjectImages from 'app/helpers/images';
import InputSearch from 'app/common/components/inputSearch';
import { InputObservable } from 'app/common/components/Input';
import Modal, { ModalAgent } from 'app/components/Modal';
import Placeholder from 'app/components/PlaceHolder';
import { ManagePromptsViewModel } from 'app/viewModels/Prompts/ManagePromptsViewModel';
import { Dashboard as DashboardFeatures } from 'common/constants/features';
import Localization from 'app/services/localization';
import { createLazy } from 'common/utils/lazy.light';

type State = {
    modalActive: boolean,
};

@observer
export default class Prompts extends React.Component<RouteComponentProps<{ clientId: string}>, State> {
    private readonly model = new ManagePromptsViewModel(this.props.match.params.clientId);

    state = {
        modalActive: false,
    };

    private readonly promptTabs = createLazy(() => [
        {
            title: 'Prompts',
            tab: this.getPromptsTab,
        },
        {
            title: 'Schedule',
            tab: this.getScheduleTab,
        },
    ]);

    componentWillUnmount() {
        this.model.dispose();
    }

    getPromptsTab = () => {
        return (
            <View className="prompt-wrap">
                <View className="actions-block">
                    <InputSearch model={this.model.prompts.search} />
                    <View onClick={this.openModal} className="add-prompt-button">
                        <Image src={ProjectImages.iconAddLink}/>
                        <Text className="label-draganddrop">Add Prompt</Text>
                    </View>
                    {this.state.modalActive && (
                        <ModalAgent>
                            {this.getModalContent()}
                        </ModalAgent>
                    )}
                </View>
                <View className="filters-block">
                    <View className="left-block">
                        <SwitchHandler
                            model={this.model.prompts.switchAll}
                            toggleAction={this.model.prompts.activateAll}
                            label="Activate all"
                        />
                        <View className="divider" />
                    </View>
                    <View className="right-block">
                        <Select
                            model={this.model.prompts.categorySelect}
                            className="filters-category white-bg"
                            buttonClassname="label-dropdown3"
                            itemClassname="label-dropdown3"
                        />
                        <View className="divider" />
                        <RadioButtonsGroup
                            model={this.model.prompts.activeRadioGroup}
                        />
                    </View>
                </View>
                <View className="prompt-list">
                    {
                        this.model.prompts.list.map((promptItemViewModel, id) => {
                            return (
                                <PromptItem
                                    key={id}
                                    item={promptItemViewModel}
                                    promptId={promptItemViewModel.id}
                                    addForm={this.model.prompts.addForm}
                                    scheduleForm={this.model.prompts.scheduleForm}
                                    model={this.model.prompts}
                                    isRecommended={DashboardFeatures.UseGPT3Suggestions ? promptItemViewModel.text === this.model.suggestedPrompt : false}
                                />
                            );
                        })
                    }
                </View>

            </View>
        );
    }

    getScheduleTab = () => {
        return (
            <View className="schedule-wrap">
                {
                    !this.model.schedule.list.length ?
                    <Placeholder
                        className="schedule-empty"
                        title="You haven’t scheduled any prompts yet"
                        description={`Schedule your prompts and they will be delivered to your ${Localization.Current.DashboardProject.clientName.plural.toLowerCase()}  whenever you need`}
                        visual={ProjectImages.JournaPlaceholder}
                    />
                    :
                    <View className="schedule-list">
                        {
                            this.model.schedule.list.map((ScheduleItemViewModel, id) => {
                                return (
                                    <ScheduleItem
                                        key={id}
                                        item={ScheduleItemViewModel}
                                        scheduleForm={this.model.schedule.scheduleForm}
                                    />
                                );
                            })
                        }
                    </View>
                }
            </View>
        );
    }

    getModalContent = () => {
        const { addForm } = this.model.prompts;

        return (
            <Modal
                title="Add prompt"
                okTitle="Add prompt"
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
                {/* <Text className="input-label label-input-label up-text">Select category</Text> */}
                <Select
                    model={addForm.category}
                    label="Select category"
                    className="select-type2 select-category"
                    buttonClassname="label-dropdown2"
                />
            </Modal>
        );
    }

    cancel = () => {
        this.closeModal();
    }

    save = async () => {
        const { addForm } = this.model.prompts;
        const res = await addForm.submit();
        if (res) {
            this.closeModal();
        }
    }

    openModal = () => {
        this.setState({ modalActive: true });
    }

    closeModal = () => {
        this.setState({ modalActive: false });
        this.model.prompts.addForm.reset();
    }

    private _onBackArrowClick = () => {
        History.goBack();
    }

    render() {
        return (
            <Page inProgress={this.model.prompts.loading || this.model.schedule.loading} className="prompts-page">
                <Container>
                    <View className="heading-wrap">
                        <View onClick={this._onBackArrowClick} className="arrow-link">
                            <Image className="arrow-icon" src={ProjectImages.backArrow} />
                        </View>
                        <View className="nav-wrap">
                            <Text className="title-h2 type5">{`Prompts for ${this.model.clientName}`}</Text>
                            <Text className="breadcrumbs label-draganddrop">check-ins / <Text className="last-breadcrumb">Manage prompts</Text></Text>
                        </View>
                    </View>
                    <View className="content">
                            <Tabs
                                model={this.model.tabs}
                                links={
                                    this.promptTabs.value.map((t, i) => {
                                        return {
                                            title: t.title,
                                            callback: () => this.model.tabs.selectedIndex = i,
                                        };
                                    })
                                }
                                tabs={this.promptTabs.value.map(t => t.tab)}
                            />
                    </View>
                </Container>
            </Page>
        );
    }
}
