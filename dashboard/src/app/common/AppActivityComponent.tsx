import React from 'react';

export type AppActivityState = {
    isActive: boolean,
};

const INACTIVE_TIMEOUT = 30 * 1000;

export class AppActivityContext extends React.Component<{}, AppActivityState> {

    public static readonly TheContext = React.createContext<AppActivityState>({ isActive: false });

    public static get Provider() { return this.TheContext.Provider; }
    public static get Consumer() { return this.TheContext.Consumer; }

    state: AppActivityState = { isActive: false };
    private _activeTimeout: number | NodeJS.Timeout;
    // private _activeTimeout: number;

    componentDidMount() {
        window.document.addEventListener('visibilitychange', this._windowVisibilityChanged);
    }

    componentWillUnmount() {
        window.document.removeEventListener('visibilitychange', this._windowVisibilityChanged);
    }

    private _windowVisibilityChanged = () => {
        const isActive = !window.document.hidden;

        if (!isActive) {
            this._activeTimeout = setTimeout(() => this.setState({ isActive: false }), INACTIVE_TIMEOUT);
        } else {
            if (this._activeTimeout) {
                clearTimeout(this._activeTimeout as number);
                this._activeTimeout = null;
            }

            if (!this.state.isActive) {
                this.setState({ isActive: true });
            }
        }
    }

    render() {
        const Provider = AppActivityContext.TheContext.Provider;

        return (
            <Provider value={{ isActive: this.state.isActive }}>
                {this.props.children}
            </Provider>
        );
    }
}