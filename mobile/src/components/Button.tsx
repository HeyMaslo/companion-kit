import React from 'react';
import {
    TouchableHighlight,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Colors from 'src/constants/colors';
import TextStyles from '../styles/TextStyles';
import AppController from 'src/controllers';

export interface ButtonProps {
    style?: any;
    onPress?: () => any | Promise<any>;
    disabled?: boolean;
    title?: string;
    isTransparent?: boolean;
    titleStyles?: any;
    withBorder?: boolean;
    underlayColor?: string;
    buttonForm?: boolean;
    icon?: React.ComponentClass;
    disabledStyle?: any;
    disabledTextStyle?: any;
}

export default class Button extends React.Component<ButtonProps> {
    private _mounted = true;

    private _onPressHandler = async () => {
        const { onPress } = this.props;

        if (onPress) {
            try {
                await onPress();
            } catch (err) {
                AppController.captureError(err);
            }
        }
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    render() {
        const { disabled, title, style, titleStyles, withBorder, underlayColor, isTransparent, buttonForm, icon, disabledStyle, disabledTextStyle } = this.props;
        const btnUnderlayColor = () => {
            if (isTransparent) {
                return Colors.borderColor;
            }
            if (buttonForm) {
                return Colors.button.buttonForm.underlay;
            }
            return Colors.button.defaultUnderlayColor;
        };
        // MK-TODO: - fix disabled style with icon
        return (
            <TouchableHighlight
                style={[styles.button, disabled && (disabledStyle ? disabledStyle : styles.disabledButton), withBorder && styles.withBorder, isTransparent && styles.buttonTransparent, buttonForm && styles.buttonForm, style]}
                onPress={this._onPressHandler}
                underlayColor={underlayColor ? underlayColor : btnUnderlayColor()}
                activeOpacity={1}
                disabled={disabled}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {icon && new icon({ style: [{ color: isTransparent ? Colors.button.transparentText : TextStyles.btnTitle.color }, { width: 30, height: 30, marginRight: 15 }] })}
                    {title
                        ? <Text style={[TextStyles.btnTitle, disabled && (disabledTextStyle ? disabledTextStyle : styles.disabledText), isTransparent ? { color: Colors.button.transparentText } : {}, buttonForm && styles.buttonFormText, titleStyles]}>
                            {title}
                        </Text>
                        : <>{this.props.children}</>
                    }
                </View>
            </TouchableHighlight>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        height: 65,
        maxHeight: 65,
        borderRadius: 5,
        backgroundColor: Colors.button.defaultBg,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        borderWidth: 0,
        borderColor: Colors.button.defaultBorder,
        flexShrink: 0,
    },
    whiteTitle: {
        color: '#fff',
    },
    disabledButton: {
        borderColor: Colors.button.disabledBorder,
        backgroundColor: Colors.button.disabledBg,
    },
    disabledText: {
        color: Colors.button.disabledText,
    },
    withBorder: {
        borderWidth: 1,
    },
    buttonTransparent: {
        borderColor: Colors.borderColor,
        backgroundColor: 'transparent',
    },
    buttonForm: {
        backgroundColor: Colors.button.buttonForm.bg,
        borderColor: Colors.button.buttonForm.border,
    },
    buttonFormText: {
        color: Colors.button.buttonForm.text,
    },
});