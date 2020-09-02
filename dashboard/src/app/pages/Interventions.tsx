import React from 'react';
import { observer } from 'mobx-react';
import { Page, View, Container, Image, Text } from 'app/common/components';
import TipItem from 'app/pages/TipItem';
import History from 'app/services/history';
import ProjectImages from 'app/helpers/images';
import InputSearch from 'app/common/components/inputSearch';
import { RouteComponentProps } from 'react-router';
import { InputObservable } from 'app/common/components/Input';
import Modal, { ModalAgent } from 'app/components/Modal';
import Placeholder from 'app/components/PlaceHolder';
import Localization from 'app/services/localization';
import InterventionsTipsViewModel, { TipItemViewModel } from 'app/viewModels/InterventionsTipsViewModel';
import MultiSelectLoader from 'app/components/MultiSelect.Loader';

type State = {
    modalActive: boolean,
    isEditMode: boolean,
};

@observer
export default class Interventions extends React.Component<RouteComponentProps<{ clientId: string}>, State> {
    private readonly model = new InterventionsTipsViewModel(this.props.match.params.clientId);

    state = {
        modalActive: false,
        isEditMode: false,
    };

    componentWillUnmount() {
        this.model.dispose();
    }

    getModalContent = () => {
        const { tipForm } = this.model;

        return (
            <Modal
                title={!this.state.isEditMode ? 'Add tip' : 'Edit tip'}
                okTitle={!this.state.isEditMode ? 'Add tip' : 'Save tip'}
                cancelTitle="Cancel"
                onOk={this.save}
                onCancel={this.cancel}
                onLayerClick={null}
                disabled={tipForm.loading}
                className="prompts-modal tips-modal"
            >
                <InputObservable
                    model={tipForm.text}
                    errorMessage={tipForm.error}
                    label="tip"
                    placeholder="Enter your tip"
                    className="prompt-text"
                    maxLength={200}
                    hasCounter={true}
                />
                <MultiSelectLoader
                    model={this.model.tipForm.mood}
                    label="Select mood"
                    className="select select-type2 multiselect"
                    placeholder="Select mood"
                />
                <Text className="desc-5 type1">The more moods you select the higher chances are for this tip to be shown.</Text>
            </Modal>
        );
    }

    cancel = () => {
        const { tipForm } = this.model;
        tipForm.tipId = null;

        this.closeModal();
    }

    save = async () => {
        const { tipForm } = this.model;
        const res = await tipForm.submit();
        if (res) {
            this.closeModal();
        }
    }

    openModal = (item?: TipItemViewModel) => {
        if (item) {
            this.model.fillAddForm(item);
            this.setState({modalActive: true, isEditMode: true });
        } else {
            this.setState({ modalActive: true, isEditMode: false });
        }
    }

    closeModal = () => {
        this.setState({ modalActive: false, isEditMode: false });
        this.model.tipForm.reset();
    }

    private _onBackArrowClick = () => {
        History.goBack();
    }

    render() {
        return (
            <Page inProgress={this.model.loading} className="prompts-page interventions-page">
                <Container>
                    <View className="heading-wrap">
                        <View onClick={this._onBackArrowClick} className="arrow-link">
                            <Image className="arrow-icon" src={ProjectImages.backArrow} />
                        </View>
                        <View className="nav-wrap">
                            <Text className="title-h2 type5">{`Interventions for ${this.model.clientName}`}</Text>
                            <Text className="breadcrumbs label-draganddrop">check-ins / <Text className="last-breadcrumb">Interventions</Text></Text>
                        </View>
                    </View>
                    <View className="content">
                        <View className="prompt-wrap interventions-wrap">
                            <View className="actions-block">
                                <InputSearch
                                    model={this.model.search}
                                    placeholder="Search for tips or moods"
                                />
                                <View onClick={() => this.openModal()} className="add-prompt-button add-tip-button">
                                    <Image src={ProjectImages.iconAddLink}/>
                                    <Text className="label-draganddrop">Add Tip</Text>
                                </View>
                                {this.state.modalActive && (
                                    <ModalAgent>
                                        {this.getModalContent()}
                                    </ModalAgent>
                                )}
                            </View>
                            {
                                !this.model.list.length ?
                                    <Placeholder
                                        className="interventions-empty schedule-empty"
                                        title="You haven’t created any interventions yet"
                                        description={`Add a tip so your ${Localization.Current.DashboardProject.clientName.plural.toLowerCase()} see it when they report a difficult or rough mood`}
                                        visual={ProjectImages.JournaPlaceholder}
                                    />
                                :
                                    <View className="prompt-list tips-list">
                                        {
                                            this.model.list.map((interventionViewModel, id) => {
                                                return (
                                                    <TipItem
                                                        key={id}
                                                        item={interventionViewModel}
                                                        // tipId={interventionViewModel.id}
                                                        tipForm={this.model.tipForm}
                                                        model={this.model}
                                                        cb={this.openModal}
                                                    />
                                                );
                                            })
                                        }
                                    </View>
                            }
                        </View>
                    </View>
                </Container>
            </Page>
        );
    }
}
