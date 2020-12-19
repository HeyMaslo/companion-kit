
import React from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import * as Routes from 'app/constants/routes';
import History from 'app/services/history';
import { Text, Image, Button } from 'app/common/components';
import Container from 'app/common/components/Container';
import AvatarImage from 'app/components/UserAvatarImage';
import AppController from 'app/controllers';
import ProjectImages from 'app/helpers/images';
import Localization from 'app/services/localization';
import ProfileViewModel from 'app/viewModels/ProfileViewModel';

type HeaderProps = {
    hasNav: boolean;
    profileOnly?: boolean;
};

class Header extends React.Component<HeaderProps> {

    get profile() { return ProfileViewModel.Instance; }

    _actionAddClient() {
        if (AppController.Instance.User.clientsLimitReached) {
            AppController.Instance.PromptModal.openModal({
                typeModal: 'positive',
                title: 'Upgrade Needed',
                message: 'We’re sorry, but you can’t add any more clients with your current plan. Please, upgrade to another one.',
                confirmText: 'Upgrade',
                rejectText: 'Cancel',
                onConfirm: () => {
                    History.push(Routes.Pricing);
                },
                onReject: () => {
                    AppController.Instance.PromptModal.closeModal();
                },
            });
        } else {
            History.push(Routes.AddNewClient);
        }
    }

    _getNavigationLinks() {
        const helpLink = Localization.Current.DashboardProject.helpLink;
        return (
            <>
                {/* {Env.EnableAdminPage && (
                    <Link to={Routes.Admin} className="clients-link">
                        <Text className="label-btn2 link-title">Admin</Text>
                    </Link>
                )} */}
                <Link to={Routes.Clients} className="clients-link">
                    <Image
                        src={ProjectImages.clientsHeaderIcon}
                    />
                    <Text className="label-btn2 link-title">{Localization.Current.DashboardProject.clientName.plural}</Text>
                </Link>
                <Button
                    title={`Add ${Localization.Current.DashboardProject.clientName.singular}`}
                    onClick={this._actionAddClient}
                    titleClassName="label-btn2 link-title"
                    className="add-client-link"
                    icon={ProjectImages.addClientHeaderIcon}
                    iconBefore={true}
                />
                {
                    (!!helpLink && helpLink.length !== 0) &&
                    <a href={helpLink} target="_blank" className="help-link">
                        <Image
                        src={ProjectImages.helpHeaderIcon}
                    />
                        <Text className="label-btn2 link-title">Help</Text>
                    </a>
                }
            </>
        );
    }

    _getNavigation() {
        const { hasNav } = this.props;
        if (!hasNav) {
            return null;
        }

        return (
            <nav>
                {this._getNavigationLinks()}
                <Link to={Routes.Profile} className="profile-button">
                    <AvatarImage />
                </Link>
            </nav>
        );
    }

    render() {
        const { hasNav} = this.props;

        return (
            <header className={`header ${hasNav ? 'full-header' : ''}`}>
                <Container>
                    <Link to={Routes.Home} className="logo" />
                    {this._getNavigation()}
                </Container>
            </header>
        );
    }
}

export default observer(Header);
