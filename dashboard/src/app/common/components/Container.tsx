import React from 'react';
import View from './View';

interface ContainerProps {
    className?: string;
    children?: any;
}

export default function Container(props: ContainerProps) {
    return (
        <View className={`${props.className || ''} container`}>
            {props.children}
        </View>
    );
}
