import React from 'react';
import { Image } from 'app/common/components';
import AppController from 'app/controllers';

import ProjectImages from 'app/helpers/images';
import { observer } from 'mobx-react';

type Props = {
    className?: string;
};

export function getUserAvatarUrl() {
    const profile = AppController.Instance.User.user;
    const authUser = AppController.Instance.Auth.authUser;
    const avatarUrl = (profile && profile.photoURL) || (authUser && authUser.photoURL) || ProjectImages.AvatarPlaceholderClient;

    return avatarUrl;
}

function UserAvatarImage(props: Props) {
    const url = getUserAvatarUrl();

    return (
        <Image className={props.className || 'round'} src={url} />
    );
}

export default observer(UserAvatarImage);
