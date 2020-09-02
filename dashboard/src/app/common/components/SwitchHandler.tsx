import React from 'react';
import { observer } from 'mobx-react';
import Text from './Text';
import View from './View';
import SwitchHandlerViewModel from 'app/viewModels/components/SwitchHandlerViewModel';

type SwitchHandlerProps = {
    model: SwitchHandlerViewModel;
    className?: string;
    disabled?: boolean;
    label?: string;
    toggleAction?: () => void;
};

export const SwitchHandler = observer((props: SwitchHandlerProps) => {

    const model = props.model;

    const _onSwitchClick = React.useCallback(() => {
        if (props.disabled) {
            return;
        }
        if (props.toggleAction) {
            props.toggleAction();
        } else {
            model.toggle();
        }
    }, [model, props]);

    const { className, disabled, label } = props;

    return (
        <View className="button-switch-wrap" onClick={_onSwitchClick}>
            <View className={`button-switch ${model.isSwitched ? 'switched' : ''} ${className || ''} ${disabled ? 'disabled' : ''}`}>
                <View className="switch-handle"></View>
            </View>
            {label && <Text className="label-dropdown3 type1 switch-label">{label}</Text>}
        </View>
    );
});

export default SwitchHandler;
