import React from 'react';
import DropdownViewModel from 'app/viewModels/components/DropdownViewModel';
import { observer } from 'mobx-react';
import { View } from 'app/common/components';
import { logger } from 'common/viewModels/SignInViewModel';

export type DropdownProps = {
    children?: any;
    className?: string;
    buttonClassname?: string;
    model: DropdownViewModel;
    buttonLabelValue?: string;
    classNameItem?: string;
};

@observer
export default class Dropdown<T extends DropdownProps = DropdownProps> extends React.Component<T> {
    ref = React.createRef<HTMLDivElement>();

    componentDidMount() {
        window.addEventListener('click', this.onClick);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.onClick);
    }

    onClick = (e: MouseEvent) => {
        const isOutside = !this.ref.current.contains(e.target as Node);

        if (isOutside) {
            this.closeDropdown();
        }
    }

    get model() { return this.props.model; }

    toggleOpen = () => {
        this.model.open = !this.model.open;
    }

    renderChildren() {
        return this.props.children;
    }

    closeDropdown = () => {
        this.model.open = false;
    }

    render() {
        const { className, buttonClassname, model, buttonLabelValue } = this.props;

        const DropdownClass = `dropdown ${className || ''} ${model.open ? 'active' : ''}`;
        const buttonClass = `button ${buttonClassname || ''}`;

        return (
            <View className={DropdownClass} divRef={this.ref}>
                <View className="button-wrap" onClick={this.toggleOpen}>
                    <View className={buttonClass}>{buttonLabelValue ? buttonLabelValue : 'Action'}</View>
                </View>
                <View className="list">
                    { this.renderChildren() }
                </View>
            </View>
        );
    }
}