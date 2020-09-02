import React from 'react';
import { View, Text } from '../common/components';
import ButtonArrow from 'app/components/ButtonArrow';
import History from 'app/services/history';
import { observer } from 'mobx-react';
import AppController from 'app/controllers';
import * as Routes from 'app/constants/routes';
import { RouteComponentProps } from 'react-router';
import { CheckEmailTypes } from 'app/constants/routes';

type Content = {
    title: String,
    reason: String,
};

const PageContent = {
    [CheckEmailTypes.SignUp]: {
        title: 'Your Magic Link',
        reason: 'for a magic link to sign in.',
    },
    [CheckEmailTypes.ResetPassword]: {
        title: 'Password Reset',
        reason: 'for a link to reset your password.',
    },
};

type Props = RouteComponentProps<{type: string}>;
type State = { content: Content };

@observer
export default class CheckYourEmail extends React.Component<Props, State> {
    state = {
        content: {
            title: '',
            reason: '',
        },
    };

    componentDidMount() {
        const { type } = this.props.match.params;
        const content = PageContent[type as CheckEmailTypes];

        this.setState({ content });
    }

    private _onLinkClick = () => {
        History.replace(Routes.Home);
    }

    render() {
        const userEmail = AppController.Instance.Auth.signinUserEmail;
        const { content } = this.state;

        return (
            <View className="auth-page check-email">
                <View className="left-block">
                    <View className="text-block">
                        <Text className="title title-h1">
                            {content.title}
                        </Text>
                        <Text className="desc title-h2">Check your e-mail <Text className="user-email">{userEmail}</Text><br></br>{content.reason}</Text>
                        <View className="btn-wrap">
                            <ButtonArrow
                                typeButton="primary"
                                title="Go back"
                                titleClassName="type1"
                                onClick={this._onLinkClick}
                                iconBefore
                            />
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}
