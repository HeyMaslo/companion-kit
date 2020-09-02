import React from 'react';
import { View,  Image } from 'app/common/components';
import { InputObservable, InputObservableProps } from 'app/common/components/Input';

import SeachIcon from 'assets/img/search-icon.svg';

export default function InputSearch(props: InputObservableProps) {
    return (
        <View className="search-wrap">
            <Image src={SeachIcon} className="search-icon" />
            <InputObservable
                {...props}
                placeholder={props.placeholder ? props.placeholder : 'Search'}
                className="search-input"
            />
        </View>
    );
}