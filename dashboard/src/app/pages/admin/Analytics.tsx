import React from 'react';
import { DatePicker } from 'app/components/DatePicker.Loader';
import { Stats as StatsFunctions } from 'common/abstractions/functions';
import Firebase from 'common/services/firebase';
import { View, Text, Button } from 'app/common/components';
import * as DateHelpers from 'common/utils/dateHelpers';

import StatsTypes = StatsFunctions.StatsTypes;

type Props = {
};

type State = {
    loading: boolean,
    analytics: StatsTypes.Analytics.Result,
    from: Date,
    to: Date,
};

let Cache: State['analytics'] = null;

export class Analytics extends React.Component<Props, State> {

    state: State = {
        loading: false,
        from: null,
        to: null,
        analytics: Cache,
    };

    componentDidMount() {
        if (!Cache) {
            this.loadAnalytics();
        }
    }

    private async loadAnalytics() {
        this.setState({ loading: true });

        const res = await Firebase.Instance.getFunction(StatsFunctions.GetAnalytics)
        .execute({
            type: StatsTypes.Analytics,
            from: this.state.from ? this.state.from.getTime() : undefined,
            to: this.state.to ? this.state.to.getTime() : undefined,
        });

        Cache = res;

        this.setState({ analytics: res, loading: false });
    }

    _fromChanged = (date: Date) => {
        if (this.state.to) {
            date = DateHelpers.min(this.state.to, date);
        }

        date = DateHelpers.startOf(date, 'day', true);
        this.setState({ from: date });
    }

    _toChanged = (date: Date) => {
        if (this.state.from) {
            date = DateHelpers.max(this.state.from, date);
        }

        date = DateHelpers.endOf(date, 'day', true);
        this.setState({ to: date });
    }

    _clearRanges = () => {
        this.setState({ from: null, to: null });
    }

    _applyRanges = () => {
        this.loadAnalytics();
    }

    renderAnalyticValue = (value: number | string[]) => {
        if (Array.isArray(value)) {
            return value.map((s, i) => (
                <div key={i}>
                    {`${i + 1}) ${s}`}<br />
                </div>
            ));
        }

        return value;
    }

    renderAnalytics() {
        if (this.state.loading) {
            return (
                <Text>Loading...</Text>
            );
        }

        const a = this.state.analytics && this.state.analytics.results;
        if (!a || !a.length) {
            return null;
        }

        return (
            <table>
                <thead>
                    <tr>
                        <td>#</td>
                        <td>Name</td>
                        <td>Value</td>
                    </tr>
                </thead>
                <tbody>
                    {a.map((aa, i) => (
                        <tr key={`${aa.key}_${i}`}>
                            <td>{i + 1}</td>
                            <td>{aa.key}</td>
                            <td>{this.renderAnalyticValue(aa.value)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    render() {
        return (
            <View className="analytics">
                <View className="range-selector">
                    <DatePicker className="light" label="From:" selected={this.state.from} onChange={this._fromChanged} />
                    <DatePicker className="light" label="To:" selected={this.state.to} onChange={this._toChanged} />
                    <Button titleClassName="label-btn4 type1" title="CLEAR" onClick={this._clearRanges} />
                    <Button titleClassName="label-btn4 type2" className="apply" title="APPLY" onClick={this._applyRanges} />
                </View>
                {this.renderAnalytics()}
            </View>
        );
    }
}
