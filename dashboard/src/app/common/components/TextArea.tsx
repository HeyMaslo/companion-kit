import React from 'react';
import { observer } from 'mobx-react';
import View from './View';
import Text from './Text';

export interface TextAreaProps {
    className?: string;
    placeholder?: string;
    name?: string;
    value?: string;
    required?: boolean;
    disabled?: boolean;
    label?: string | JSX.Element;
    labelDesc?: string;
    classWrapper?: string;
    onChange?: (value: string) => void;
    errorMsg?: string;
    onBlur?: () => void;
    maxLength?: number;
    lightTheme?: boolean;
    createRef?: React.RefObject<HTMLTextAreaElement>;
}

export default class TextArea<TProps extends TextAreaProps = TextAreaProps> extends React.Component<TProps> {

    private _onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.currentTarget.value;
        this.onChanging(value);

        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    onBlur = () => {
        if (this.props.onBlur) {
            this.props.onBlur();
        }
    }

    protected onChanging(val: string) { }

    protected getValue() {
        return this.props.value;
    }

    render() {
        const { className, placeholder, name, disabled, required, label, labelDesc, errorMsg, maxLength, lightTheme, createRef } = this.props;
        const value = this.getValue();
        const inputClass = `${className || ''} ${disabled ? 'disabled' : ''}${value ? 'filled' : 'empty'} input-wrap ${lightTheme ? 'light' : ''}`;

        return (
            <View className={inputClass} >
                {
                    label &&
                    (<Text className="input-label label-input-label up-text">
                        {label}
                        {labelDesc &&
                            <Text className="label-btn3 up-text type3 label-desc">{labelDesc}</Text>
                        }
                    </Text>)
                }
                <textarea
                    className="input label-client-item input-placeholder"
                    placeholder={placeholder}
                    name={name}
                    value={value}
                    disabled={disabled}
                    required={required}
                    onChange={this._onChange}
                    onBlur={this.onBlur}
                    maxLength={maxLength}
                    ref={createRef}
                />
                {errorMsg ? <Text className="input-error up-text input-error-message">{errorMsg}</Text> : null}
            </View>
        );
    }
}

interface ITextAreaModel {
    value: string;
    focused: boolean;
}

type TextAreaObservableProps = TextAreaProps & { model: ITextAreaModel };

@observer
export class TextAreaObservable extends TextArea<TextAreaObservableProps> {
    onChanging(val: string) {
        const { model } = this.props;
        if (model) {
            model.value = val;
        }
    }

    onBlur = () => {
        const { model } = this.props;
        if (model) {
            model.focused = false;
        }
    }

    getValue() {
        const { model } = this.props;

        const value = (model && model.value) != null
            ? model.value
            : this.props.value;
        return value;
    }
}
