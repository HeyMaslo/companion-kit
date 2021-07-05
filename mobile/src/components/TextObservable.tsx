import React from 'react';
import { Text, TextProps } from 'react-native';
import { observer } from 'mobx-react';
import { Text as TextVM } from 'common/viewModels';

type Props = TextProps & {
    model: TextVM;
};

const TextObservable = (props: Props) => {
    const value = props.model && props.model.value;
    return <Text {...props}>{value}</Text>;
};

export default observer(TextObservable);
