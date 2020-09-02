import React from 'react';
import Scrollbars from 'react-custom-scrollbars';

type ScrollableContainerProps = {
    className?: string;
    scrollbarClassName?: string;
    trackClassName?: string;
};

export default class ScrollableContainer extends React.Component<ScrollableContainerProps> {
    private _renderTrackVertical = () => {
        const trackClass = this.props.trackClassName ? `${this.props.trackClassName}` : '';

        return (
            <div className={`scrollbar-track ${trackClass}`}></div>
        );
    }

    private _renderThumbVertical = () => {
        const barClassName = this.props.scrollbarClassName ? this.props.scrollbarClassName : '';

        return (
            <div className={`scrollbar-thumb ${barClassName}`}></div>
        );
    }

    render() {
        const { children, className } = this.props;
        const containerClassName = className ? `scrollbarContainer ${className}` : '';

        return (
            <Scrollbars
                autoHeight
                // autoHeightMin={700}
                autoHeightMax="60vh"
                className={containerClassName}
                renderTrackVertical={this._renderTrackVertical}
                renderThumbVertical={this._renderThumbVertical}
            >
                {children}
            </Scrollbars>
        );
    }
}