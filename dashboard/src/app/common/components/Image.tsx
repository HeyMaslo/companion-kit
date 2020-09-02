import React, { CSSProperties } from 'react';

type ImageProps = {
    src?: string;
    className?: string;
    style?: CSSProperties;
    alt?: string;
    onClick?: () => void;
    onLoad?: () => void;
    onError?: () => void;
};

export default function Image(props: ImageProps) {
    const imgProps: ImageProps = {};

    if (props.src) {
        imgProps.src = props.src;
    }

    if (props.className) {
        imgProps.className = props.className;
    }

    if (props.onClick) {
        imgProps.onClick = props.onClick;
    }

    if (props.style) {
        imgProps.style = props.style;
    }

    if (props.onLoad) {
        imgProps.onLoad = props.onLoad;
    }

    if (props.onError) {
        imgProps.onError = props.onError;
    }

    return (
        <img
            {...imgProps}
            alt={props.alt || ''}
        />
    );
}
