import React from 'react';
import {
    TouchableHighlight,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import TextStyles from '../styles/TextStyles';
import AppController from 'src/controllers';
import Layout from 'src/constants/Layout';
import { Theme } from 'src/constants/theme/PStheme';

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
    theme: Theme;
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
        const { disabled, title, style, titleStyles, withBorder, underlayColor, isTransparent, buttonForm, icon, disabledStyle, disabledTextStyle, theme } = this.props;
        const defualtDisabledStyle = { backgroundColor: theme.colors.highlightSecondary };
        return (
            <TouchableHighlight
                style={[{ ...styles.button, backgroundColor: theme.colors.highlight }, disabled && (disabledStyle || defualtDisabledStyle), withBorder && { ...styles.withBorder, borderColor: theme.colors.highlightSecondary }, isTransparent && { backgroundColor: 'transparent', borderColor: theme.colors.highlightSecondary }, buttonForm && styles.buttonForm, style]}
                onPress={this._onPressHandler}
                underlayColor={underlayColor ? underlayColor : theme.colors.highlightSecondary}
                activeOpacity={1}
                disabled={disabled}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {icon && new icon({ style: [{ color: isTransparent ? theme.colors.highlight : theme.colors.background }, { width: 30, height: 30, marginRight: 15 }] })}
                    {title
                        ? <Text style={[TextStyles.btnTitle, disabled && disabledTextStyle, { color: isTransparent ? theme.colors.highlight : theme.colors.background }, titleStyles]}>
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
        width: Layout.window.width * 0.88,
        height: 55,
        maxHeight: 65,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        borderWidth: 0,
        flexShrink: 0,
    },
    withBorder: {
        borderWidth: 1,
    },
    buttonForm: {
        backgroundColor: '#E7E1F2',
        borderColor: 'transparent',
    },
});