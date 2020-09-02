import React from 'react';
import { View } from 'app/common/components';

export type CardProps = {
    active: boolean;
    // model: JournalItem | SessionItem;
    // clientId: string;
};

export default class Card<TProps, TState = {}> extends React.Component<TProps & CardProps, TState> {
    goToInner = () => { }

    getInfoBlock(): JSX.Element { return null; }

    getContent(): JSX.Element { return null; }

    render() {
        return (
            <View className={`audio-card ${this.props.active ? 'active' : ''}`}>
                <View className="redirect-layer" onClick={this.goToInner} />
                {this.getContent()}
                {this.getInfoBlock()}
            </View>
        );
    }
}