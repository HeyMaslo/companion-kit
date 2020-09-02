import React from 'react';

import { ActivityComponent } from 'common/components/ActivityComponent';
import { BeforeUnload } from 'common/components/BeforeUnload';

import { ITrackerFactory } from 'common/services/analytics/clientTracker';

export class ClientTrackerComponent extends React.Component<ClientTrackerComponent.Props> {

    private _began: boolean;

    componentDidMount() {
        this.props.tracker.create(this.props.userId, this.props.isActive);
        this._began = this.props.isActive;
    }

    componentDidUpdate(prevProps: ClientTrackerComponent.Props) {
        if (this.props.userId !== prevProps.userId) {
            this.props.tracker.Instance?.updateUserId(this.props.userId || null);
        }

        if (this.props.isActive && !prevProps.isActive && !this._began) {
            this._began = true;
            this.props.tracker.Instance?.beginSession();
        }
    }

    private onUnload = () => {
        this.props.tracker.destroy();
    }

    private _onActivate = () => {
        this.props.tracker.Instance?.activate();
    }

    private _onDeactivate = () => {
        this.props.tracker.Instance?.deactivate();
    }

    render() {
        return this.props.isActive && this.props.tracker.Instance && (
            <>
                <BeforeUnload callback={this.onUnload} />
                <ActivityComponent
                    onActivate={this._onActivate}
                    onDeactivate={this._onDeactivate}
                />
            </>
        );
    }
}

export namespace ClientTrackerComponent {
    export type Props = {
        tracker: ITrackerFactory;
        isActive: boolean;
        userId: string;
    };
}