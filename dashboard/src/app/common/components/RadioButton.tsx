import React from 'react';
import View from './View';
import Text from './Text';

interface RadioButtonProps {
    className?: string;
    onClick: (index: number) => void;
    label: string;
    checked: boolean;
    index: number;
}

const RadioButton = (props: RadioButtonProps) => {

    const _onClick = React.useCallback(() => {
        props.onClick(props.index);
    }, [props.onClick, props.index]);

    const { checked, className, label } = props;
    const radioButtonDefaultClass = `radio-button ${className || ''} ${checked ? 'checked' : ''}`;

    return (
        <View className={radioButtonDefaultClass} onClick={_onClick}>
            <View
                className="radio-button-circle"
            />
            <Text className="radio-button-text">{label.toLowerCase()}</Text>
        </View>
    );
};

export default RadioButton;
