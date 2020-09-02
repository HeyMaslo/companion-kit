import React from 'react';
import { View, Text, Image } from 'app/common/components';
import TabsViewModel from 'app/viewModels/components/TabsViewModel';
import { observer } from 'mobx-react';
import History from 'app/services/history';

export type TabItemRenderer = JSX.Element | (() => JSX.Element);
export type TabItemLink = {
    title: string;
    route?: string;
    callback?: () => void;
};

export interface TabsProps {
    model: TabsViewModel;
    tabs: TabItemRenderer[];
    links: TabItemLink[];
    className?: string;
}

function _renderCurrentTab(this: void, items: TabItemRenderer[], model: TabsViewModel): JSX.Element {
    if (!items || !items.length || model.selectedIndex < 0 || model.selectedIndex >= items.length) {
        return null;
    }

    const item = items[model.selectedIndex];

    if (typeof item === 'function') {
        return item();
    }
    return item;
}

const Tabs = observer((props: TabsProps) => {

    const { model, links, tabs } = props;
    const currentIndex = model.selectedIndex;

    return (
        <View className="tabs-wrap">
            <View className="tab-controls">
                { links.map((link, i) => {
                    const linkClassName = (i === currentIndex) ? 'active' : '';

                    return (
                        <Text
                            onClick={link.route ? (() => History.push(link.route)) : link.callback}
                            key={link.title}
                            className={`label-tabs up-text ${linkClassName}`}>
                            {link.title}
                        </Text>
                    );
                })}
            </View>
            { _renderCurrentTab(tabs, model) }
        </View>
    );
});

export default Tabs;