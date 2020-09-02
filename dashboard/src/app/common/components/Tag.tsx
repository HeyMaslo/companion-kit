import React from 'react';
import Text from './Text';
import View from './View';

interface TagProps {
    className?: string;
    label?: string;
    iconSrc: string;
    alt?: string | 'tag icon';
}

export default class Tag extends React.Component<TagProps> {
    render() {
        const { className, label, iconSrc, alt } = this.props;
        const tagDefaultClass = `tag ${className || ''}`;

        return (
            <View className={tagDefaultClass}>
                <img
                    className="tag-icon"
                    src={iconSrc}
                    alt={alt}
                />
                <Text className="label-tag">{label}</Text>
            </View>
        );
    }
}
