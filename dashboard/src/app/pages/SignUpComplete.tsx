import React from 'react';
import { View, Text, Image, Page, Container  } from '../common/components';
import ButtonArrow from 'app/components/ButtonArrow';
import VideoModal from 'app/components/VideoModal';
import AppController from 'app/controllers';
import * as Routes from 'app/constants/routes';
import history from 'app/services/history';

import ProjectImages from 'app/helpers/images';
import Localization from '../services/localization';

const useTakeTheTour = false;

const VideoUrl = 'https://www.youtube.com/watch?v=0FFRLfBoJe8&feature=youtu.be';
const IntroMessage = Localization.Current.DashboardProject.onboardingMessage
    || `Glad to see you here. I’m ${Localization.Current.DashboardProject.projectName} and I want to show you my main parts of the interface. It’s helpful for you, ${Localization.Current.DashboardProject.userName.singular}, if you never met ${Localization.Current.DashboardProject.projectName} before. What do you think? Are you in?`;

export default class SignUpComplete extends React.Component {
    state = {
        isModalOpen: false,
        inProgress: false,
    };

    private _mounted = false;

    compomentDidMount() {
        this._mounted = true;
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    private _onTakeTourClick = () => {
        this.setState({
            isModalOpen: true,
        });
    }

    private _onFinish = async () => {
        try {
            this.setState({ isModalOpen: false, inProgress: true });

            await AppController.Instance.User.finishOnBoarding();

            history.push(Routes.Clients);
        } finally {
            if (this._mounted) {
                this.setState({ inProgress: false });
            }
        }
    }

    render() {
        const user = AppController.Instance.User.user;
        const name = (user && (user.firstName || user.displayName)) || 'Stranger';

        return (
            <Page className="onboarding-page" inProgress={this.state.inProgress}>
                <Container className="onboarding-container">
                    <View className="image-block">
                        <Image src={ProjectImages.SignUpCompleteVisual} />
                    </View>
                    <View className="text-block">
                        <Text className="title title-h1">
                            <Text className="name">Welcome, {name}</Text>
                        </Text>
                        <Text className="description desc-3">
                            {IntroMessage}
                        </Text>
                        <View className="btn-wrap">
                            {useTakeTheTour ? (
                                <ButtonArrow
                                    typeButton="primary"
                                    title="take the tour"
                                    titleClassName="type1"
                                    onClick={this._onTakeTourClick}
                                />
                            ) : (
                                <ButtonArrow
                                    typeButton="primary"
                                    title="take me in"
                                    titleClassName="type1"
                                    onClick={this._onFinish}
                                />
                            )}
                        </View>
                    </View>
                </Container>
                { useTakeTheTour && (
                    <VideoModal
                        isOpen={this.state.isModalOpen}
                        videoUrl={VideoUrl}
                        onClose={this._onFinish}
                    />
                )}
            </Page>
        );
    }
}
