import React from 'react';
import { observer } from 'mobx-react';
import View from './View';
import RadioButton from './RadioButton';
import { SelectString } from 'common/viewModels/SelectViewModel';

interface RadioButtonsGroupProps {
    className?: string;
    model: SelectString;
    onChange?: () => void;
}

@observer
export default class RadioButtonsGroup<T> extends React.Component<RadioButtonsGroupProps & T> {

    _onRadioClick = (index: number) => {
        this.props.model.index = index;

        if (this.props.onChange) {
            this.props.onChange();
        }
    }

    renderRadioButtons(radioButtons: string[]) {
        return radioButtons.map((label, index) => {
            return (
                <RadioButton
                    key={index}
                    onClick={i => this._onRadioClick(i)}
                    label={label}
                    index={index}
                    checked={this.props.model.index === index}
                />
            );
        });
    }

    render() {
        const { className, model } = this.props;
        const defaultClassName = `radio-buttons-group ${className || ''} ${model.selectedItem ? '' : 'not-selected'}`;

        return (
            <View className={defaultClassName}>
                {this.renderRadioButtons(model.values)}
            </View>
        );
    }
}