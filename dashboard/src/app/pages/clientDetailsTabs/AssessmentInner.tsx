 import React from 'react';
import { observer } from 'mobx-react';
import { Page, View, Container, Image, Text } from 'app/common/components';
import { AssessmentItem } from 'app/viewModels/AssessmentItemPage';
import IntakeFormList from './IntakeFormList';
import Localization from 'app/services/localization';
import { AssessmentType } from 'common/models';
import { RouteComponentProps } from 'react-router';
import History from 'app/services/history';
import ProjectImages from 'app/helpers/images';
import Placeholder from 'app/components/PlaceHolder';

type AssessmentInnerProps = RouteComponentProps<{ type: AssessmentType, clientId: string }> ;

@observer
export default class AssessmentInner extends React.Component<AssessmentInnerProps> {
    private readonly model = new AssessmentItem();

    componentDidMount() {
        const { clientId, type } = this.props.match.params;
        this.model.setFormType(clientId, type);
    }

    componentWillUnmount() {
        this.model.dispose();
    }

    private _onBackArrowClick = () => {
        History.goBack();
    }

    private _actionBtnClick = (status: Boolean) => {
        if (status) {
            this.model.deactivate();
        } else {
            this.model.activate();
        }
    }

    private _actionBtnSendNowClick = () => {
        this.model.activate(true);
    }

    render() {
        return (
            <Page inProgress={this.model.loading} className="assessment-inner-page">
                <Container>
                    <View className="heading-wrap">
                        <View className="left-block">
                            <View onClick={this._onBackArrowClick} className="arrow-link">
                                <Image className="arrow-icon" src={ProjectImages.backArrow} />
                            </View>
                            <View className="nav-wrap">
                                <View className="name-type-wrap">
                                    <Text className="title-h2 type5 name-type">{this.model.fullType}</Text>
                                    {
                                        this.model.fullType === 'PTSD-RI' &&
                                        <Text className="assessment-type-copyright">Copyright 2019, The Regents of the University of California</Text>
                                    }
                                </View>
                                <Text className="breadcrumbs label-draganddrop">{`${this.model.clientName} / `}<Text className="last-breadcrumb">{this.model.fullType}</Text></Text>
                            </View>
                        </View>
                        <View className="right-block">
                            {
                                this.model.date &&
                                <View className="date-sent-block">
                                    <Text className="desc-5 type3">
                                        {
                                            this.model.date && this.model.nextAssessment ?
                                                'Next assessment will be sent: '
                                                :
                                                'Last assessment was sent: '
                                        }
                                        <Text className="desc-5 type4">{this.model.date}</Text>
                                    </Text>
                                </View>
                            }
                            <View className="action-block">
                                {
                                    this.model.isFormActive &&
                                    <View className="send-now-btn"
                                    onClick={() => this._actionBtnSendNowClick()}
                                >
                                    <Text className="label-btn2 type3">Activate now</Text>
                                </View>
                                }
                                <View className="deactivate-btn"
                                    onClick={() => this._actionBtnClick(this.model.isFormActive)}
                                >
                                    <Text className="label-btn2 type3">{ this.model.isFormActive ? 'deactivate assessment' : 'Activate assessment' }</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    {
                        this.model.list && !this.model.list.length ?
                            (
                                <Placeholder
                                    className="assessment-inner-empty"
                                    title={`${Localization.Current.DashboardProject.clientName.singularCapitalized} hasn't taken ${this.model.fullType} yet`}
                                    description={`Please ask your ${Localization.Current.DashboardProject.clientName.singular.toLowerCase()} about it`}
                                    visual={ProjectImages.JournaPlaceholder}
                                />
                            )
                        :
                            (

                                <IntakeFormList
                                    className="intake-form-list"
                                    list={this.model.list}
                                    clientId={this.model.clientId}
                                />
                            )
                    }
                </Container>
            </Page>
        );
    }
}
