import React from 'react';

export type Title = {
    className?: string;
    children?: any;
}

export default function Title(props: Title) {
    return(
        <span className={props.className || ''}>
            {props.children}
        </span>
    );
}
