import React from 'react';
import { observer } from 'mobx-react';
import { RouteComponentProps } from 'react-router';
import { Container, View, Text, Page, Image } from 'app/common/components';
import History from 'app/services/history';
import { IntakeFormViewModel } from 'app/viewModels/IntakeFormViewModel';
import { AssessmentType } from 'common/models';

import ProjectImages from 'app/helpers/images';

type Props = RouteComponentProps<{ clientId: string, type: AssessmentType, id: string }>;

@observer
export default class IntakeFormInner extends React.Component<Props> {
    private readonly _viewModel = new IntakeFormViewModel();

    componentDidMount() {
        this.updateFormEntry();
    }

    componentDidUpdate() {
        this.updateFormEntry();
        if (this._viewModel.entryExists === false) {
            this._onBackArrowClick();
        }
    }

    private updateFormEntry() {
        const { id, type, clientId } = this.props.match.params;
        this._viewModel.setFormEntry(clientId, type, id);
    }

    private _onBackArrowClick = () => {
        History.goBack();
    }

    renderContent() {
        if (!this._viewModel.formItem) {
            return null;
        }

        const {
            dateTime,
            recommendation,
            answersBlock,
            fullType,
            date,
            clientName,
        } = this._viewModel.formItem;

        return (
            <>
                <Container className="heading-container">
                    <View onClick={this._onBackArrowClick} className="arrow-link">
                        <Image className="arrow-icon" src={ProjectImages.backArrow} />
                    </View>
                    <View className="text-content">
                        <View className="text-block">
                            <Text className="title-h2 type5 name-type">{fullType}</Text>
                            <Text className="title-h2 type5 date">{date}</Text>
                        </View>
                        <View className="nav-wrap">
                            <Text className="breadcrumbs label-draganddrop">{`${clientName} / ${fullType} / `}<Text className="last-breadcrumb">{fullType} {date}</Text></Text>
                        </View>
                        {/* <View className="recommend-block">
                            <Text className="label phq9-inner-recommend-label">Recommendation:</Text>
                            <Text className="recommend label-client-item">
                                {recommendation.action}
                            </Text>
                        </View> */}
                    </View>
                </Container>
                <Container className="content">
                    <View className="answers-list">
                        {
                            answersBlock.map((item, i) => (
                                <View
                                    key={i}
                                    className="answer-item"
                                >
                                    <Text className="question label-client-item">
                                        {i + 1}. {item.question}
                                    </Text>
                                    <Text className="answer label-client-item">
                                        {item.answer}
                                    </Text>
                                </View>
                            ))
                        }
                    </View>
                </Container>
            </>
        );
    }

    render() {
        const content = this.renderContent();
        const loading = !content || this._viewModel.inProgress;

        return (
            <Page className="intake-form-inner-page">
                {content}
            </Page>
        );
    }
}
