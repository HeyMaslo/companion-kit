import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { observer } from 'mobx-react';
import RadioButton from './RadioButton';
import * as ViewModels from 'common/viewModels';
import Container from './Container';

type RadioButtonsGroupProps = {
    model: ViewModels.SelectString;
    style?: StyleProp<ViewStyle>;
};

const RadioButtonGroup = observer((props: RadioButtonsGroupProps) => {
    const { model, style } = props;

    const onRadioClick = React.useCallback(
        (index: number) => {
            model.index = index;
        },
        [model],
    );

    const renderRadioButtons = (radioButtons: string[]) => {
        return radioButtons.map((label, index) => {
            return (
                <RadioButton
                    key={index}
                    onClick={onRadioClick}
                    label={label}
                    index={index}
                    checked={model.index === index}
                />
            );
        });
    };

    return (
        <Container style={style}>{renderRadioButtons(model.values)}</Container>
    );
});

export default RadioButtonGroup;
