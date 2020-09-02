import React, { CSSProperties } from 'react';
import { observer } from 'mobx-react';

export interface ITextProps {
    className?: string;
    style?: CSSProperties;
    ref?: any;
    children?: any;
    value?: string;
    onClick?: () => void;
}

function TextImpl(props: ITextProps, value: string = null) {

    const isWindows = ['Win32', 'Win64', 'Windows', 'WinCE'].indexOf(window.navigator.platform) !== -1;
    const winClassName = isWindows ? 'windowsOS' : '';

    const p = {
        className: `${props.className || ''} ${winClassName}`,
        style: props.style,
        ref: props.ref,
        onClick: props.onClick,
    };

    const content = value || props.value;

    return (
        <span {...p}>
            {content == null ? props.children : content}
        </span>
    );
}

export default function Text(props: ITextProps) {
    return TextImpl(props);
}

interface IObservableText {
    readonly value: string;
}

export const TextObservable = observer((props: ITextProps & { model: IObservableText } ) => {
    const value = (props.model && props.model.value) || null;
    return TextImpl(props, value);
});
