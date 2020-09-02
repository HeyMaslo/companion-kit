import React from 'react';

export class BeforeUnload extends React.Component<{ callback: () => void }> {

    get active() { return !!window && !!window.addEventListener; }

    listener = () => {
        if (this.props.callback) {
            this.props.callback();
        }
    }

    componentDidMount() {
        if (this.active) {
            window.addEventListener('beforeunload', this.listener);
        }
    }

    componentWillUnmount() {
        if (this.active) {
            window.removeEventListener('beforeunload', this.listener);
        }
    }

    render() {
        return null as JSX.Element;
    }
}
