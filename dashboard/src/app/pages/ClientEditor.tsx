import React from 'react';
import { observer } from 'mobx-react';
import { Container, View, Text, Page, Image } from 'app/common/components';
import ButtonArrow from 'app/components/ButtonArrow';
import { RouteComponentProps } from 'react-router';
import History from '../services/history';
import ClientEditorViewModel from 'app/viewModels/ClientEditorViewModel';
import ProjectImages from 'app/helpers/images';
import ButtonColor from 'app/components/ButtonColor';
import ClientForm from 'app/components/ClientEditorForm';
import Localization from 'app/services/localization';
import logger from 'common/logger';
import { DemoAccounts } from 'common/viewModels/SignInViewModel';

const ProjectTexts = Localization.Current.DashboardProject;

type Props = RouteComponentProps<{ clientId: string}>;

function PageTitle(props: { title: string, description: string }) {
    return (
        <View className="text-block">
            <Text className="title title-h1">{props.title}</Text>
            <Text className="desc-1">Fill these inputs {props.description}</Text>
        </View>
    );
}

@observer
export default class ClientEditor extends React.Component<Props> {

    private readonly model = new ClientEditorViewModel();

    componentDidMount() {
        this._setClientId();

        document.addEventListener('keypress', this.onEnterPress);
    }

    componentWillUnmount() {
        this.model.dispose();

        document.removeEventListener('keypress', this.onEnterPress);
    }

    private onEnterPress = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            this.submit();
        }
    }

    private submit = async () => {
        const res = await this.model.submit();
        if ( res && !res.ok ) {
            this.scrollToFirstError();
        }
    }

    scrollToFirstError() {
        const el = document.querySelector('.error-state');
        window.scrollTo(0, el.scrollTop);
    }

    componentDidUpdate(prevProps: Props) {
        const clientId = this.props.match.params.clientId;

        if (clientId !== prevProps.match.params.clientId) {
            this._setClientId();
        }
    }

    private _setClientId() {
        const clientId = this.props.match.params.clientId;
        this.model.setClientId(clientId);
    }

    private _onBackArrowClick = () => {
        History.goBack();
    }

    render() {
        const { isEditMode, isInvitation } = this.model;
        const title = !isEditMode
            ? `Add ${ProjectTexts.clientName.singularCapitalized}`
            : (isInvitation
                ? 'Edit Invite'
                : `Edit ${ProjectTexts.clientName.singularCapitalized}`
            );

        const pageDescription = !isEditMode
            ? `to add a new ${ProjectTexts.clientName.singular}`
            : (isInvitation
                ? 'to change info about the invite'
                : `to change info about the ${ProjectTexts.clientName.singular}`
            );

        return (
            <Page inProgress={this.model.inProgress} className={`add-new-client-page`}>
                <Container className="heading-container">
                    <View onClick={this._onBackArrowClick} className="arrow-link">
                        <Image className="arrow-icon" src={ProjectImages.backArrow} />
                    </View>
                    <PageTitle
                        title={title}
                        description={pageDescription}
                    />
                </Container>
                <View className="form-container">
                    <Container>
                        <ClientForm model={this.model} />
                        <View className="bottom-wrap">
                            <View className="btn-wrap">
                                {!isEditMode ? (
                                    <ButtonArrow
                                        typeButton="primary"
                                        title="send an invite"
                                        titleClassName="type4"
                                        onClick={this.submit}
                                    />
                                    ) : (
                                        !DemoAccounts.includes(this.model.email.value) && (
                                            <>
                                                <ButtonArrow
                                                    typeButton="primary"
                                                    title={this.model.isEmailChanged ? 'save changes and Invite again' : 'save changes'}
                                                    titleClassName="type4"
                                                    onClick={this.submit}
                                                />
                                                <ButtonColor
                                                    onClick={this.model.promptToDelete}
                                                    titleClassName="type3"
                                                    title={isInvitation ? 'Delete Invite' : 'Deactivate Account'}
                                                />
                                            </>
                                        )
                                    )
                                }
                            </View>
                            { this.model.error && (
                                <View className="error-wrap">
                                    <Text className="up-text input-error-message">{this.model.error}</Text>
                                </View>
                            )}
                        </View>
                    </Container>
                </View>
            </Page>
        );
    }
}
