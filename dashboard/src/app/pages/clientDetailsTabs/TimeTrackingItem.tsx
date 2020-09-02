import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, Button } from 'app/common/components';
import DropdownList from 'app/common/components/DropdownList';
import DropdownViewModel from 'app/viewModels/components/DropdownViewModel';
import { formatToLocalDate } from 'common/utils/dateHelpers';
import TimeTrackingViewModel, { TimeTrackingListItem } from 'app/viewModels/TimeTracking/TimeTrackingViewModel';
import { TimeTrackingFormVM } from 'app/viewModels/TimeTracking/TimeTrackingFormViewModel';

interface TimeTrackingItemProps {
    item: TimeTrackingListItem,
    form: TimeTrackingFormVM,
    model: TimeTrackingViewModel,
    className?: string,
    cb?: (item: TimeTrackingListItem) => void,
}

@observer
export default class TimeTrackingItem extends React.Component<TimeTrackingItemProps> {

    dropdownRef = React.createRef<DropdownList>();

    readonly dropdownVM = new DropdownViewModel();

    onClick = (cb: () => void) => {
        this.dropdownRef.current?.closeDropdown();
        cb();
    }

    render() {
        const { item, className, cb } = this.props;

        return (

            <View className={`timetracking-item row ${className || ''}`}>
                <View className="label-client-item type1 column column-1">{formatToLocalDate(item.date)}</View>
                <View className="label-client-item type1 column column-2">{item.activity}</View>
                <View className="label-client-item type1 column column-3">{item.diagnosis || '—'}</View>
                <View className="label-client-item type1 column column-4">{`${item.time}m`}</View>
                <View className="label-client-item type1 column column-5">{item.notes || '—'}</View>
                <View className="label-client-item type1 column column-6">
                    <Text className="label-client-item type1">{item.billable}</Text>
                    <View className="dropdown-wrap">
                        <Text className="dotters desc-1">...</Text>
                        <DropdownList
                            model={this.dropdownVM}
                            buttonClassname="desc-1"
                            classNameItem="dropdown-item"
                            buttonLabelValue="..."
                            ref={this.dropdownRef}
                            items={[
                                <Button
                                    className={`btn-action`}
                                    titleClassName="label-dropdown3 "
                                    title="Edit"
                                    onClick={() => cb(item)}
                                />,
                                <Button
                                    className={`btn-action`}
                                    titleClassName="label-dropdown3 "
                                    title="Duplicate"
                                    onClick={() => this.onClick(item.duplicateTracking)}
                                />,
                                <Button
                                    className={`btn-action`}
                                    titleClassName="label-dropdown3 type2"
                                    title="Delete"
                                    onClick={() => this.onClick(item.removeTracking)}
                                />,
                            ]}
                        />
                    </View>
                </View>
            </View>
        );
    }
}
