import React from 'react';
import Button, { ButtonProps } from './Button';
import { ActivityIndicator, ActivityIndicatorProps } from 'react-native';

export type Props = ButtonProps & {
    loading: boolean | 'promise';
    activity?: ActivityIndicatorProps | JSX.Element;
};

type State = {
    loading?: boolean;
};

export default class ActivityButton extends React.Component<Props, State> {
    private _mounted = false;

    state: State = {};

    onPress = async () => {
        this.setState({ loading: true });
        try {
            if (this.props.onPress) {
                await this.props.onPress();
            }
        } finally {
            if (this._mounted) {
                this.setState({ loading: false });
            }
        }
    };

    componentDidMount() {
        this._mounted = true;
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    render() {
        const loading =
            this.props.loading === 'promise'
                ? this.state.loading || false
                : this.props.loading;

        const content = loading ? (
            React.isValidElement(this.props.activity) ? (
                this.props.activity
            ) : (
                <ActivityIndicator size="small" {...this.props.activity} />
            )
        ) : (
            this.props.children
        );

        return (
            <Button
                {...this.props}
                onPress={this.onPress}
                title={loading ? null : this.props.title}
                disabled={loading || this.props.disabled}>
                {content}
            </Button>
        );
    }
}
