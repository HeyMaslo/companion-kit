import React from 'react';
import {
    View,
    StyleSheet,
    TouchableHighlight,
    Text,
    Image,
} from 'react-native';
import TextStyles from 'src/styles/TextStyles';

// TODO: implement svg usage
const editIcon = require('./assets/edit-icon.png');
const addIcon = require('./assets/add-icon.svg');

interface IIconButtonProps {
    style?: any;
    title?: string;
    type: string;
    onPress?: Function;
}

export default class IconButton extends React.Component<IIconButtonProps> {
    private _getIconPath(type) {
        switch (type) {
            case 'edit':
                return editIcon;
            case 'add':
            default:
                return addIcon;
        }
    }

    private _onPressHandler = () => {
        const { onPress } = this.props;

        if (onPress) {
            onPress();
        }
    };

    render() {
        const { type, style, title } = this.props;
        const icon = this._getIconPath(type);

        // TODO: implement svg usage
        return (
            <TouchableHighlight
                style={[styles.container, style]}
                underlayColor="transparent"
                onPress={this._onPressHandler}>
                <>
                    <View style={styles.iconWrap}>
                        <Image style={styles.icon} source={icon} />
                    </View>
                    <Text
                        style={[
                            TextStyles.labelSmall,
                            { textTransform: 'uppercase' },
                        ]}>
                        {title}
                    </Text>
                </>
            </TouchableHighlight>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrap: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    icon: {
        width: '100%',
        height: '100%',
    },
});
