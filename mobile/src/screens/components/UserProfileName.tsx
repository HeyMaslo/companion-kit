import React from 'react';
import { observer } from 'mobx-react';
import { Text } from 'react-native';
import { UserProfileViewModel } from 'src/viewModels/UserProfileViewModel';

export const UserProfileName = observer(
    (props: { model: UserProfileViewModel; placeholder?: string }) => {
        return (
            <Text style={{ textTransform: 'capitalize' }}>
                {props.model.value?.displayName || props.placeholder || ''}
            </Text>
        );
    },
);
