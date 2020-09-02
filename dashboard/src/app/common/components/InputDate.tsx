import React from 'react';
import { InputObservable, InputObservableProps } from './Input';

export default function InputDate(props: InputObservableProps) {
    const isSafari = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;

    if (isSafari) {
        return (
            <InputObservable
                {...props}
                type="text"
                label="Date"
                mask="9999-99-99"
                placeholder="YYYY-MM-DD"
            />
        );
    }

    return (
        <InputObservable
            {...props}
            type="date"
        />
    );
}
