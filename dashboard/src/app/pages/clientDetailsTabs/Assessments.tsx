import React from 'react';
import { observer } from 'mobx-react';
import { View, Page, Text, Image } from 'app/common/components';
import Placeholder from 'app/components/PlaceHolder';
import AssessmentsList from './AssessmentsList';
import Localization from 'app/services/localization';
import { AssessmentsViewModel } from 'app/viewModels/Assessments';
import Select from 'app/common/components/Select';
import Modal, { ModalAgent } from 'app/components/Modal';
import ProjectImages from 'app/helpers/images';

type AssessmentsProps = {
    model: AssessmentsViewModel;
};

type State = {
    modalActive: boolean,
};

@observer
export default class Assessments extends React.Component<AssessmentsProps, State> {

    state = {
        modalActive: false,
    };

    get model() { return this.props.model; }

    getModalContent = () => {
        const  assessmentSelect  = this.props.model.assessmentSelect;

        return (
            <Modal
                title="Activate assessment"
                okTitle="Activate assessment"
                cancelTitle="Cancel"
                onOk={this.save}
                onCancel={this.cancel}
                onLayerClick={null}
            >
                <Text className="input-label label-input-label up-text"> Select assessment</Text>
                <Select
                    model={assessmentSelect}
                    className="select-type2 select-assessment"
                    buttonClassname="label-dropdown2"
                />
            </Modal>
        );
    }

    cancel = () => {
        this.closeModal();
    }

    save = async () => {
        this.closeModal();
        this.model.intakeForm.activate();
    }

    openModal = () => {
        this.setState({ modalActive: true });
    }

    closeModal = () => {
        this.setState({ modalActive: false });
    }

    render() {
        const { modalActive } = this.state;
        const { loading } = this.model;

        if (this.model.list && !this.model.list.length) {
            return (
                <Page
                    inProgress={loading}
                >
                    <Placeholder
                        className="assessments-empty"
                        title={`No active assessments yet`}
                        description={`Your ${Localization.Current.DashboardProject.clientName.singular.toLowerCase()} will get a notification after you activate an assessment`}
                        visual={ProjectImages.JournaPlaceholder}
                        buttonTitle="Activate assessment"
                        action={this.openModal}
                    />
                    {modalActive && (
                        <ModalAgent>
                            {this.getModalContent()}
                        </ModalAgent>
                    )}
                 </Page>
            );
        }

        return (
            <Page inProgress={loading}>
                <View className="assessments-tab">
                    <View className="actions-block">
                        <View onClick={this.openModal} className="add-link-button">
                            <Image src={ProjectImages.iconAddLink}/>
                            <Text className="label-draganddrop">Activate assessment</Text>
                        </View>
                    </View>
                    <AssessmentsList
                        className="assessments-list"
                        list={this.model.list}
                    />
                </View>
                {modalActive && (
                    <ModalAgent>
                        {this.getModalContent()}
                    </ModalAgent>
                )}
            </Page>
        );
    }
}
