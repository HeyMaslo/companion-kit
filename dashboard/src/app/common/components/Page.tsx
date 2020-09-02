import React, { ReactNode } from 'react';
import View from './View';
import Preloader from './Preloader';

type Props = {
    children?: ReactNode;
    className?: string;
    inProgress?: boolean;
    onKeyPress?: React.KeyboardEventHandler<HTMLDivElement>;
};

export default function Page(props: Props) {
    let className = 'page ';

    if (props.className) {
        className += props.className;
    }

    return (
        <View className={className} onKeyPress={props.onKeyPress} tabIndex={0} >
            {props.children}
            { props.inProgress && (
                <Preloader isSingle={false} />
            )}
        </View>
    );
}
