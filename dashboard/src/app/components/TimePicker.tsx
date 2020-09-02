import React from 'react';
import { observer } from 'mobx-react';
import TimePickerLib, { TimePickerProps } from 'rc-time-picker';
import moment from 'moment';
import Text from 'app/common/components/Text';
import { View } from 'app/common/components';
import { DateViewModel } from 'common/viewModels';

type Props = TimePickerProps & {
    label?: string,
    model: DateViewModel,
};

const TimePicker = observer((props: Props) => {

    const [isOpen, setIsOpen] = React.useState<boolean>(false);

    const { className, disabled, label, model, minuteStep } = props;

    const onChange = React.useCallback((v: moment.Moment) => {
        if (model) {
            model.value = v.toDate();
        }
    }, [model]);

    const onOpenChange = React.useCallback((state: { open: boolean }) => {
        setIsOpen(state.open);
    }, [setIsOpen]);

    const wrapperClass = `input-wrap timepicker-wrap ${className || ''} ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''} ${model.error ? 'error' : ''}`;

    const wrapperRef = React.useRef<HTMLDivElement>();
    const additionalProps: any = {
        getPopupContainer: () => wrapperRef.current,
    };

    return (
        <View className={wrapperClass} divRef={wrapperRef}>
            <Text className="input-label label-input-label up-text">
                {label || 'Time'}
            </Text>
            <TimePickerLib
                {...additionalProps}
                value={model?.value ? moment(model.value) : null}
                onChange={onChange}
                onOpen={onOpenChange}
                onClose={onOpenChange}
                open={isOpen}
                defaultValue={moment()}
                showSecond={false}
                placeholder={'Select a time'}
                minuteStep={minuteStep || 15}
                use12Hours={true}
                inputIcon={<View className="triangle" />}
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

export default TimePicker;
