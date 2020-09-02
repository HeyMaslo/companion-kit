import React from 'react';
import DatePickerLib, { ReactDatePickerProps } from 'react-datepicker';
import { observer } from 'mobx-react';
import Text from 'app/common/components/Text';
import { View, Image } from 'app/common/components';

import calendarIcon from 'assets/img/date-icon2.svg';

type Props = ReactDatePickerProps & {
    label?: string,
    pickerClassNmae?: string,
    renderAfter?: JSX.Element,
    onChange?: (value: Date) => void;
};

type ObservableProps = Partial<Props> & {
    model: {
        value: Date,
        error?: string,
    },
};

export function DatePicker(props: Props) {
    const wrapperClass = `input-wrap datepicker-wrap ${props.className || ''} ${props.disabled ? 'disabled' : ''} ${props.selected ? 'filled' : 'empty'}`;

    return (
        <View className={wrapperClass}>
            <Text className="input-label label-input-label up-text">
                {props.label || 'date'}
            </Text>
            <DatePickerLib
                {...props}
                popperPlacement="bottom-start"
                popperModifiers={{
                    flip: {
                    enabled: false,
                    },
                    preventOverflow: {
                    enabled: true,
                    escapeWithReference: false,
                    }
                }}
                className={`input label-client-item input-placeholder ${props.pickerClassNmae || ''}`}
                placeholderText="Select a date"
            />
            <Image className="input-icon" src={calendarIcon} />
            {props.renderAfter}
        </View>
    );
}

export const DatePickerObservable = observer((props: ObservableProps): JSX.Element => {

    const onChange = React.useCallback((d: Date) => {
        props.model.value = d;
        if (props.onChange) {
            props.onChange(props.model.value);
        }
    }, [props.model]);

    const pickerProps: Props = {
        ...props,
        selected: props.model.value,
        onChange: onChange,
        pickerClassNmae: props.model.error ? 'error-state' : '',
        renderAfter: props.model.error ? (
            <Text className="input-error up-text input-error-message">
                {props.model.error}
            </Text>
        ) : null,
    };

    return (
        <DatePicker {...pickerProps} />
    );
});
