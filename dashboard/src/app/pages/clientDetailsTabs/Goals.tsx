import React from 'react';
import { observer } from 'mobx-react';
import { Page, View, Image, Text } from 'app/common/components';
import GoalItem from 'app/pages/clientDetailsTabs/GoalItem';
import History from 'app/services/history';
import ProjectImages from 'app/helpers/images';
import InputSearch from 'app/common/components/inputSearch';
import { InputObservable } from 'app/common/components/Input';
import Modal, { ModalAgent } from 'app/components/Modal';
import Placeholder from 'app/components/PlaceHolder';
import { TextInputVM } from 'common/viewModels';
import GoalsViewModel, { GoalItemViewModel } from 'app/viewModels/GoalsViewModel';
import logger from 'common/logger';

type GoalsProps = {
    model: GoalsViewModel;
};

type State = {
    modalActive: boolean,
    isEditMode: boolean,
};

@observer
export default class Goals extends React.Component<GoalsProps, State> {
    private get model(): GoalsViewModel { return this.props.model; }

    state = {
        modalActive: false,
        isEditMode: false,
    };

    componentWillUnmount() {
        this.model.dispose();
    }

    getModalContent = () => {
        const { editModal } = this.model;

        return (
            <Modal
                title={!this.state.isEditMode ? 'Add goal' : 'Edit goal'}
                okTitle={!this.state.isEditMode ? 'Add goal' : 'Save goal'}
                cancelTitle="Cancel"
                onOk={this.save}
                onCancel={this.cancel}
                onLayerClick={null}
                disabled={editModal.loading}
                className="prompts-modal tips-modal goal-modal"
            >
                <InputObservable
                    model={editModal.text}
                    errorMessage={editModal.error}
                    label="Goal"
                    placeholder="Enter your goal"
                    className="prompt-text"
                    maxLength={150}
                    hasCounter={true}
                />
            </Modal>
        );
    }

    cancel = () => {
        this.closeModal();
    }

    save = async () => {
        const { editModal } = this.model;
        const res = await editModal.submit();
        if (res?.ok) {
            this.closeModal();
        }
    }

    openModal = (item?: GoalItemViewModel) => {
        if (item) {
            this.model.editModal.setItem(item);
            this.setState({modalActive: true, isEditMode: true });
        } else {
            this.setState({ modalActive: true, isEditMode: false });
        }
    }

    closeModal = () => {
        this.setState({ modalActive: false, isEditMode: false });
        this.model.editModal.reset();
    }

    render() {
        return (
            <Page inProgress={this.model.loading} className="goals-page">
                <View className="goals-tab">
                    <View className="actions-block">
                        <InputSearch
                            model={this.model.search}
                            placeholder="Search"
                        />
                        <View onClick={() => this.openModal()} className="add-prompt-button add-goal-button">
                            <Image src={ProjectImages.iconAddLink}/>
                            <Text className="label-draganddrop">Add Goal</Text>
                        </View>
                        {this.state.modalActive && (
                            <ModalAgent>
                                {this.getModalContent()}
                            </ModalAgent>
                        )}
                    </View>
                    {
                        (!this.model.list.length && !this.model.search.value) ? (
                            <Placeholder
                                className="interventions-empty goals-empty"
                                title="You don’t have any goals"
                                description="Let’s add your first one!"
                                visual={ProjectImages.GoalsPlaceholder}
                            />
                        ) : (
                            <View className="goals-list">
                                {
                                    this.model.list.map((goalViewModel, id) => {
                                        return (
                                            <GoalItem
                                                key={id}
                                                item={goalViewModel}
                                                editModal={this.model.editModal}
                                                cb={this.openModal}
                                            />
                                        );
                                    })
                                }
                            </View>
                        )
                     }
                </View>
            </Page>
        );
    }
}
