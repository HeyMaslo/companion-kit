import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, Button, Tooltip } from 'app/common/components';
import InterventionsTipsViewModel, { TipItemViewModel, TipsFormVM } from 'app/viewModels/InterventionsTipsViewModel';
import DropdownList from 'app/common/components/DropdownList';
import DropdownViewModel from 'app/viewModels/components/DropdownViewModel';
import { DateFormats } from 'common/viewModels/charts/GradientChartViewModel';
import { TipsLabels } from 'common/models';

interface TipItemProps {
    item: TipItemViewModel,
    // tipId: string,
    className?: string,
    tipForm: TipsFormVM,
    model: InterventionsTipsViewModel,
    cb?: (item: TipItemViewModel) => void,
}

@observer
export default class TipItem extends React.Component<TipItemProps> {

    dropdownRef = React.createRef<DropdownList>();

    readonly dropdownVM = new DropdownViewModel();

    onClick = (cb: () => void) => {
        this.dropdownRef.current?.closeDropdown();
        cb();
    }

    render() {
        const { item, className, cb } = this.props;
        const dateFeedback = DateFormats.DayOfWeek(new Date(item.date));
        const countMoods = item.labels.length;
        const countMoodsText = `${countMoods} mood${countMoods > 1 ? 's' : ''}`;
        const moodsString = item.labels.map(l => TipsLabels.Strings[l]).join(', ');

        return (
            <View className={`prompt-item tip-item ${className || ''}`}>
                <View className="left-block">
                    <View className={`feedback-wrap ${item.status.style}`}>
                        <Tooltip
                            title={item.status.name}
                            message={item.date ? dateFeedback : null}
                            direction="top"
                        />
                    </View>
                    <Text className="prompt-text desc-3 type1"> {item.text} </Text>
                </View>
                <View className="right-block">
                    <View className="counter">
                        <Text className="desc-3 type5">{countMoodsText}</Text>
                        <Tooltip
                            title={moodsString}
                            direction="bottom-center"
                        />
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
                                    onClick={() => this.onClick(item.duplicate)}
                                />,
                                <Button
                                    className={`btn-action`}
                                    titleClassName="label-dropdown3 type2"
                                    title="Remove"
                                    onClick={() => this.onClick(item.removeTip)}
                                />,
                            ]}
                        />
                    </View>
                </View>
            </View>
        );
    }
}
