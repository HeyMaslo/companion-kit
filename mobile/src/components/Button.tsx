import React from 'react';
import {
    TouchableHighlight,
    StyleSheet,
    Text,
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
        const { disabled, title, style, titleStyles, withBorder, underlayColor, isTransparent, buttonForm, theme } = this.props;
        // const btnUnderlayColor = () => {
        //     if (isTransparent) {
        //         return Colors.borderColor;
        //     }
        //     if (buttonForm) {
        //         return Colors.button.buttonForm.underlay;
        //     }
        //     return Colors.button.defaultUnderlayColor;
        // };

        return (
            <TouchableHighlight
                style={[{ ...styles.button, backgroundColor: theme.colors.highlight }, withBorder && { ...styles.withBorder, borderColor: theme.colors.highlight }, isTransparent && { backgroundColor: 'transparent', borderColor: theme.colors.highlightSecondary }, style]}
                onPress={this._onPressHandler}
                // underlayColor={underlayColor ? underlayColor : btnUnderlayColor()}
                activeOpacity={1}
                disabled={disabled}
            >
                {title
                    ? <Text style={[TextStyles.btnTitle, isTransparent ? { color: theme.colors.highlight } : { color: theme.colors.background }, titleStyles]}>
                        {title}
                    </Text>
                    : <>{this.props.children}</>
                }
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
    whiteTitle: {
        color: '#fff',
    },
    // disabledButton: {
    //     borderColor: Colors.button.disabledBorder,
    //     backgroundColor: Colors.button.disabledBg,
    // },
    // disabledText: {
    //     color: Colors.button.disabledText,
    // },
    withBorder: {
        borderWidth: 1,
    },
    // buttonForm: {
    //     backgroundColor: Colors.button.buttonForm.bg,
    //     borderColor: Colors.button.buttonForm.border,
    // },
    // buttonFormText: {
    //     color: Colors.button.buttonForm.text,
    // },
});