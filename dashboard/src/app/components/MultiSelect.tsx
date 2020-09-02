import React from 'react';
import { observer } from 'mobx-react';
import Select, { Props } from 'react-select';
import { View, Text } from 'app/common/components';
import { MultiselectViewModel } from 'common/viewModels/MultiselectViewModel';
import logger from 'common/logger';

type MultiselectProps = Props & {
    label?: string,
    className?: string,
    model: MultiselectViewModel,
    placeholder?: string,
};

const MultiSelect = observer((props: MultiselectProps) => {

    const { label, model, placeholder, className } = props;

    const onChange = React.useCallback((value) => {
        if (model) {
            model.selectedItems = value;
        }
    }, [model]);

    const wrapperClass = `select-wrap ${model.error ? 'error' : ''}`;

    return (
        <View className={wrapperClass}>
            <Text className="input-label label-input-label up-text">
                {label || 'Select'}
            </Text>
            <Select
                {...props}
                isMulti={true}
                classNamePrefix="multiselect"
                closeMenuOnSelect={false}
                options={model?.items ? model.items : null}
                value={model?.selectedItems ? model.selectedItems : null}
                onChange={onChange}
                placeholder={placeholder || 'Select'}
                className={`${className} ${model.error ? ' error' : ''}`}
                minMenuHeight={1}
            />
            {
                model.error ? (
                    <Text className="input-error up-text input-error-message">
                        {model.error}
                    </Text>
                ) : null
            }
        </View>
    );
});

export default MultiSelect;