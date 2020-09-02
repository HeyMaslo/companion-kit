import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, Image, Page, Container, Button } from '../common/components';
import ToDesktopPageVM from 'app/viewModels/ToDesktopPageViewModel';
import Preloader from 'app/common/components/Preloader';

import ProjectImages from 'app/helpers/images';
import Localization from 'app/services/localization';

const ContactUsLink = Localization.Current.DashboardProject.contactUsLink;
const ContactUsEmail = Localization.Current.DashboardProject.contactUsEmail;

@observer
export default class ToDesktop extends React.Component {
    model = new ToDesktopPageVM();

    componentWillUnmount() {
        this.model.reset();
    }

    render() {
        return (
            <Page className="todesktop-page">
                {this.model.processing && <Preloader/>}
                <View className="todesktop-header">
                    <Container className="todesktop-header-container">
                        <View className="todesktop-logo" onClick={this.model.reset} />
                        <Button
                            title="logout"
                            onClick={this.model.signOut}
                            titleClassName="label-btn4 type2"
                            className="add-client-link"
                        />
                    </Container>
                </View>
                {!this.model.successfullySent ? (
                    <Container className="todesktop-container">
                        <Image className="todesktop-image" src={ProjectImages.toDesktopVisual} />
                        <View className="text-block">
                            <Text className="title title-h1">
                                Optimized for Desktop
                            </Text>
                            <Text className="desc desc-3">
                                Rotate your device to landscape mode to view the dashboard.
                            </Text>
                            <Text className="desc desc-3">
                                Still having trouble? Please email us at <a href={ContactUsLink} className="desc-3 type3">{ContactUsEmail}</a>
                            </Text>
                            {/* <View className="btn-wrap">
                                <ButtonArrow
                                    typeButton="primary"
                                    title="Send me the link"
                                    titleClassName="type1"
                                    onClick={this.model.sendLink}
                                    disabled={this.model.processing}
                                />
                            </View>
                            {this.model.showError && <Text className="input-error-message">Oops, something went wrong. Try again</Text>} */}
                        </View>
                    </Container>
                ) : (
                    <Container className="link-sent-container">
                        <Image className="link-sent-image" src={ProjectImages.SuccessSendVisual} />
                        <View className="text-block">
                            <Text className="title title-h1">Your link has been successfully sent</Text>
                        </View>
                    </Container>
                )}
            </Page>
        );
    }
}
