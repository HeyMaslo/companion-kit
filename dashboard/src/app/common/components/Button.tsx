import React, { CSSProperties } from 'react';
import Text from './Text';

type ButtonProps = {
    className?: string;
    titleClassName?: string;
    title?: string;
    children?: any;
    style?: CSSProperties;
    disabled?: boolean;
    icon?: string;
    iconAlt?: string;
    iconBefore?: boolean;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

export type Icon = {
    src: string;
    alt: string;
};

export default class Button<T = any> extends React.Component<ButtonProps & T> {

    getClassName(): string {
        return `btn ${this.props.className || ''}`;
    }

    getTitleClassName(): string {
        return this.props.titleClassName;
    }

    getIcon(): Icon {
        const { icon, iconAlt } = this.props;

        if (!icon) {
            return null;
        }

        return {
            src: icon,
            alt: iconAlt,
        };
    }

    getChildren(): any {
        return this.props.children;
    }

    render() {
        const { title, onClick, style, disabled, iconBefore } = this.props;

        const p: React.ButtonHTMLAttributes<HTMLButtonElement> = {
            className: this.getClassName(),
            onClick: onClick,
            style: style,
            disabled: disabled,
        };

        const icon = this.getIcon();
        const titleClassName = this.getTitleClassName();
        const children = this.getChildren();

        return (
            <button {...p}>
                {icon && iconBefore && <img className="icon" src={icon.src} alt={icon.alt} />}
                <Text className={titleClassName}>
                    {title}
                    {children}
                </Text>
                {icon && !iconBefore && <img className="icon" src={icon.src} alt={icon.alt} />}
            </button>
        );
    }

}
