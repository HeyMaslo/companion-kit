import React from 'react';
import View from './View';
import Text from './Text';
import Image from './Image';

import ProjectImages from 'app/helpers/images';

type TooltipProps = {
    className?: string;
    message?: string;
    title: string;
    direction?: 'top' | 'left' | 'right' | 'bottom' | 'bottom-center' ;
    isWhite?: boolean;
};

type TooltipState = {
    isActive: boolean;
};

export default class Tooltip extends React.Component<TooltipProps, TooltipState> {

    state = {
        isActive: false,
    };

    hideTooltip = () => {
        this.setState({
            isActive: false,
        });
    }

    showTooltip = () => {
        this.setState({
            isActive: true,
        });
    }

    render() {
        const { message, title, className, direction, isWhite } = this.props;
        const tooltipDirection = direction ? direction : 'bottom';

        return (
            <View className={`tooltip ${className ? className : ''}`}
                onMouseLeave={this.hideTooltip}
            >
                {this.state.isActive &&
                    <View className={`tooltip-bubble tooltip-${tooltipDirection}`}>
                        <Text className="tooltip-title">{title}</Text>
                        {
                            message &&
                            <Text className="tooltip-message">{message}</Text>
                        }
                    </View>
                }
                <View className={`tooltip-trigger ${isWhite ? 'white' : ''}`} onMouseEnter={this.showTooltip}>
                    <View className="tooltip-circle">
                        <Image src={ProjectImages.questionIcon} />
                    </View>
                </View>
            </View>
        );
    }
}