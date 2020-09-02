import React from 'react';

export type Props = {
    onActivate?: () => void;
    onDeactivate?: () => void;

    children?: any;
};

export class ActivityComponent extends React.Component<Props> {
    componentDidMount() {
        if (this.props.onActivate) {
            this.props.onActivate();
        }
    }

    componentWillUnmount() {
        if (this.props.onDeactivate) {
            this.props.onDeactivate();
        }
    }

    render() {
        return this.props.children || null;
    }
}
