import React from 'react';
import * as ViewModels from 'common/viewModels';
import { observer } from 'mobx-react';
import { View } from '.'; // ??????
import Text from './Text';
import logger from 'common/logger';

export interface SelectPropsCustom {
    classNameWrapper?: string;
    className?: string;
    buttonClassname?: string;
    itemClassname?: string;
    model: ViewModels.Select;
    disabled?: boolean;
    label?: string | JSX.Element;
    required?: boolean;
    placeholder?: string;
}

@observer
export default class Select extends React.Component<SelectPropsCustom> {
    wrapperRef: React.RefObject<HTMLDivElement> = React.createRef();

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    handleClickOutside = (e: MouseEvent) => {
        /** click outside when select is open */
        if (this.wrapperRef && !this.wrapperRef.current.contains(e.target as Node) && this.props.model.open) {
            this.props.model.open = false;
        }
    }

    toggleOpen = () => {
        if (this.props.disabled) {
            return;
        }
        this.props.model.open = !this.props.model.open;
    }

    onSelect = (index: number) => {
        this.props.model.index = index;
        this.toggleOpen();
    }

    render() {
        const { classNameWrapper, className, buttonClassname, itemClassname, model, label, required, placeholder } = this.props;
        let { disabled } = this.props;

        if (!model.values || !model.values.length) {
            disabled = true;
        }
        const selected = model.selectedValue || placeholder  || 'Select';

        const selectClass = `select ${className || ''} ${model.open ? 'active' : ''} ${model.error ? 'error' : ''} ${disabled ? 'disabled' : ''}`;
        const buttonClass = `button label-dropdown1 ${buttonClassname || ''} ${model.selectedValue == null ? 'placeholder' : ''}`;

        return (
            <View className={`select-wrap ${classNameWrapper}`}>
                {
                    label &&
                    (<Text className="input-label label-input-label up-text">
                        {label}
                        {/* {required && <Text className="required-sign">*</Text>} */}
                    </Text>)
                }
                <View className={selectClass} divRef={this.wrapperRef}>
                    <View className="button-wrap" onClick={this.toggleOpen}>
                        <View className={buttonClass}>
                            { selected }
                        </View>
                        { !disabled && (
                            <View className="triangle" />
                        )}
                    </View>

                    <ul className="list">
                        {model.values.map((text, i) => {
                            return <li key={i} onClick={() => this.onSelect(i)} className={`label-dropdown1 ${itemClassname || ''}`}>{text}</li>;
                        })}
                    </ul>
                </View>
                {model.error ? <Text className="input-error up-text input-error-message">This field is required</Text> : null}
            </View>
        );
    }
}