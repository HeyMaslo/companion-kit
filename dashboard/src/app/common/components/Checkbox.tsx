import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, Image } from 'app/common/components';
import CheckboxViewModel from 'app/viewModels/components/CheckboxViewModel';

import arrowChecked from 'assets/img/checked-white.svg';
import logger from 'common/logger';

interface CheckboxProps {
    className?: string;
    checked?: boolean;
    checkedDefault?: boolean;
    disabled?: boolean;
    label?: string;
    onClick?: () => void;
}

function CheckboxImpl(props: CheckboxProps) {

    const checkbox = {
        className: `checkbox-wrap ${props.className || ''} ${ props.checked ? 'checked' : ''} ${props.disabled ? 'disabled' : ''}`,
        onClick: props.onClick,
    };

    return (
        <View {...checkbox}>
            <View className="checkbox">
                <Image
                    src={arrowChecked}
                />
            </View>
            {
                props.label &&
                    <Text className="label-client-item type1">{props.label}</Text>
            }
        </View>
    );
}

export default function Checkbox(props: CheckboxProps) {
    return CheckboxImpl(props);
}

type ObservableProps = CheckboxProps & {
    model: CheckboxViewModel,
};

export const CheckboxObservable = observer((props: ObservableProps) => {

    React.useEffect(() => {
        if (props.checkedDefault) {
            props.model.isChecked = true;
        }
    }, []);

    const CheckboxObservableProps: ObservableProps = {
        ...props,
        checked: props.model.isChecked,
        onClick: () => {
            props.model.toggleChecked();
            if (props.onClick) {
                props.onClick();
            }
        },
    };

    return CheckboxImpl(CheckboxObservableProps);
});
