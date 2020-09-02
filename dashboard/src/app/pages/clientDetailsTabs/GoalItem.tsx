import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, Button, Tooltip } from 'app/common/components';
import Checkbox from 'app/common/components/Checkbox';
import { InputObservable } from 'app/common/components/Input';
import DropdownList from 'app/common/components/DropdownList';
import DropdownViewModel from 'app/viewModels/components/DropdownViewModel';
import Modal, { ModalAgent } from 'app/components/Modal';
import { formatDate } from 'common/utils/dateHelpers';
import CheckboxViewModel from 'app/viewModels/components/CheckboxViewModel';
import { GoalItemViewModel, GoalEditModalVM } from 'app/viewModels/GoalsViewModel';
import AppController from 'app/controllers';

interface GoalItemProps {
    item: GoalItemViewModel,
    editModal: GoalEditModalVM,
    className?: string,
    cb?: (item: GoalItemViewModel) => void,
}

@observer
export default class GoalItem extends React.Component<GoalItemProps> {

    dropdownRef = React.createRef<DropdownList>();

    readonly dropdownVM = new DropdownViewModel();

    onClick = (cb: () => void) => {
        this.dropdownRef.current?.closeDropdown();
        cb();
    }

    onDuplicate = () => {
        this.props.item.duplicate();
    }

    onRemove = () => {
        AppController.Instance.PromptModal.openModal({
            typeModal: 'negative',
            title: 'Are you sure?',
            message: 'Deleted goals can’t be restored.',
            confirmText: 'Delete',
            rejectText: 'Cancel',
            onConfirm: this.props.item.remove,
        });
    }

    render() {
        const { item, className, cb } = this.props;

        const mainDate = item.isCompleted
            ? `done ${formatDate(item.dateCompleted)}`
            : `added ${formatDate(item.dateCreated)}`;
        const secondaryDate = item.isCompleted
            ? `added ${formatDate(item.dateCreated)}`
            : null;

        const statusName = item.status;
        const statusStyle = statusName; // TODO

        return (
            <View className={`goal-item ${className || ''}`}>
                <View className="left-block">
                    <Checkbox
                        checked={item.isCompleted}
                        onClick={item.toggleCompleted}
                    />
                    <Text className="goal-text desc-3 type1"> {item.text} </Text>
                </View>
                <View className="right-block">
                    <View className={`status-wrap ${statusStyle}`}>
                        <Text className="desc-3 type5">{mainDate}</Text>
                        {
                            secondaryDate &&
                            <Tooltip
                                title={secondaryDate}
                                direction="top"
                            />
                        }
                    </View>
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
                                    onClick={() => this.onClick(this.onDuplicate)}
                                />,
                                <Button
                                    className={`btn-action`}
                                    titleClassName="label-dropdown3 type2"
                                    title="Remove"
                                    onClick={() => this.onClick(this.onRemove)}
                                />,
                            ]}
                        />
                    </View>
                </View>
            </View>
        );
    }
}
