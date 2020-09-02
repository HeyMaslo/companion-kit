import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, Image } from 'app/common/components';
import InputMask from 'react-input-mask';
import ProjectImages from 'app/helpers/images';

export interface InputProps {
    type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel';
    className?: string;
    placeholder?: string;
    name?: string;
    value?: string;
    required?: boolean;
    disabled?: boolean;
    label?: string | JSX.Element;
    classWrapper?: string;
    onChange?: (value: string) => void;
    onSubmit?: () => void;
    errorMessage?: string;
    infoMessage?: string;
    onBlur?: () => void;
    lightTheme?: boolean;
    createRef?: React.RefObject<HTMLInputElement>;
    mask?: string;
    maskChar?: string;
    alwaysShowMask?: boolean;
    maxLength?: number;
    autocomplete?: string;
    hasCounter?: boolean;
    max?: number;
    min?: number;
}

export default class Input<TProps extends InputProps = InputProps> extends React.Component<TProps> {

    protected get error() { return this.props.errorMessage; }

    private _onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        this.onChanging(value, e.currentTarget);

        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    onBlur = () => {
        if (this.props.onBlur) {
            this.props.onBlur();
        }
    }

    protected onChanging(val: string, target?: HTMLInputElement) { /* */ }

    protected getValue() {
        return this.props.value;
    }

    protected onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (this.props.onSubmit && event.key === 'Enter') {
            this.props.onSubmit();
        }
    }

    render() {
        const {
            className,
            placeholder,
            type,
            name,
            disabled,
            required,
            label,
            lightTheme,
            createRef,
            mask,
            maskChar,
            alwaysShowMask,
            maxLength,
            autocomplete,
            hasCounter,
            max,
            min,
            infoMessage,
        } = this.props;
        const errorMessage = this.error;
        const value = this.getValue();
        const inputClass = `${className || ''} ${disabled ? 'disabled' : ''} ${value ? 'filled' : 'empty'} input-wrap ${lightTheme ? 'light' : ''}`;

        return (
            <View className={inputClass} >
                {
                    label &&
                    (<Text className="input-label label-input-label up-text">
                        {label}
                        {/* {required && <Text className="required-sign">*</Text>} */}
                        {/* {required && <Text className="required-sign">*</Text>} */}
                    </Text>)
                }
                {
                    !mask ?
                        <input
                            className={`input label-client-item input-placeholder ${errorMessage ? 'error-state' : ''}`}
                            placeholder={placeholder}
                            type={type || 'text'}
                            name={name}
                            value={value || ''}
                            disabled={disabled}
                            required={required}
                            onChange={this._onChange}
                            onBlur={this.onBlur}
                            ref={createRef}
                            maxLength={maxLength}
                            autoComplete={autocomplete}
                            onKeyPress={this.onKeyPress}
                            max={max}
                            min={min}
                        />
                    :
                        <InputMask
                            className={`input label-client-item input-placeholder ${errorMessage ? 'error-state' : ''}`}
                            placeholder={placeholder}
                            type={type || 'text'}
                            name={name}
                            value={value || ''}
                            disabled={disabled}
                            required={required}
                            onChange={this._onChange}
                            onBlur={this.onBlur}
                            mask={mask}
                            maskChar={maskChar}
                            alwaysShowMask={alwaysShowMask}
                            maxLength={maxLength}
                            autoComplete={autocomplete}
                            max={max}
                            min={min}
                        />
                }
                {
                    hasCounter && maxLength &&
                    <Text className="counter desc-5">{maxLength - value.length} characters left</Text>
                }
                {
                    errorMessage ?
                        <Text className="input-error up-text input-error-message">{errorMessage}</Text>
                    :
                    (
                        infoMessage ?
                            <Text className="input-error up-text input-error-message input-error-message--info">
                                <Image src={ProjectImages.infoMessageIcon} className="info-icon" />
                                {infoMessage}
                            </Text>
                        :
                            null
                    )
                }
            </View>
        );
    }
}

interface IInputModel {
    value: string;
    focused: boolean;
    error: string;
}

export type InputObservableProps = InputProps & { model: IInputModel };

@observer
export class InputObservable extends Input<InputObservableProps> {

    state = { } as { inputValue?: string };

    get error() { return this.props.errorMessage || this.props.model?.error; }

    onChanging(val: string, target: HTMLInputElement) {
        const { model } = this.props;
        if (model) {
            if (this.props.type === 'number' && this.props.maxLength && val.length > this.props.maxLength) {
                return;
            }
            // const prevVal = model.value;
            model.value = val;
            // console.log(`INPUT onChanging "${prevVal}" => "${val}" => "${model.value}"`);
            if (model.value !== val) { // additional formatting has been applied
                // remember and restore caret position to avoid jumping it to the end
                const deltaL = model.value.length > val.length // only if formatting has added some additional symbols
                    ? 1 : 0;
                const pos = target.selectionStart + deltaL;
                this.setState({ inputValue: model.value }, () => {
                    target.selectionStart = pos;
                    target.selectionEnd = pos;
                });
            } else {
                // directly change state without additional re-render triggering
                this.state.inputValue = undefined;
            }
        }
    }

    onBlur = () => {
        const { model } = this.props;
        if (model) {
            model.focused = false;
        }
    }

    getValue() {
        const modelValue = this.props.model?.value;

        let value: string;
        if (this.state.inputValue !== undefined) {
            value = this.state.inputValue;
            this.state.inputValue = undefined;
        } else {
            value = modelValue != null
                ? modelValue
                : super.getValue();
        }

        // console.log(`INPUT current value = "${value}" | "${this.state.inputValue}" | "${modelValue}"`);

        return value;
    }
}
