import React from 'react';

type IViewProps = React.PropsWithChildren<{
    className?: string;

    onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
    onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
    onMouseMove?: React.MouseEventHandler<HTMLDivElement>;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
    onKeyPress?: React.KeyboardEventHandler<HTMLDivElement>;
    onEnterPress?: React.KeyboardEventHandler<HTMLDivElement>;

    tabIndex?: number;
    style?: React.CSSProperties;
    id?: string;
    divRef?: React.Ref<HTMLDivElement>;
}>;

function getOnEnterPress(props: IViewProps): React.KeyboardEventHandler<HTMLDivElement> {
    if (!props.onKeyPress && !props.onEnterPress) {
        return null;
    }

    if (!props.onEnterPress) {
        return props.onKeyPress;
    }

    return function (this: HTMLDivElement, e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key === 'Enter') {
            props.onEnterPress.call(this, e);
        }

        if (props.onKeyPress) {
            props.onKeyPress.call(this, e);
        }
    };
}

function View(props: IViewProps) {

    const p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> = {
        className: props.className || '',
        onMouseEnter: props.onMouseEnter,
        onMouseLeave: props.onMouseLeave,
        onMouseMove: props.onMouseMove,
        onClick: props.onClick,
        onKeyPress: getOnEnterPress(props),

        style: props.style,
        id: props.id,
        ref: props.divRef,
    };

    if (props.tabIndex != null) {
        p.tabIndex = props.tabIndex;
    }

    return (
        <div {...p}>
            {props.children}
        </div>
    );
}

export default View;
