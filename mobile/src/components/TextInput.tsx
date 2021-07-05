import React from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Text,
    TextInputProps,
    StyleProp,
    TextStyle,
    NativeSyntheticEvent,
    TextInputFocusEventData,
} from 'react-native';
import { observer } from 'mobx-react';
import { TextInputVM } from 'common/viewModels';
import Colors from 'src/constants/colors';
import TextStyles from 'src/styles/TextStyles';

interface ITextInputProps {
    model: TextInputVM | null;
    forceError?: string;
    placeholder?: string;
    styleInput?: StyleProp<TextStyle>;
    styleWrap?: StyleProp<TextStyle>;
    styleError?: StyleProp<TextStyle>;
    styleLabel?: StyleProp<TextStyle>;
    secureTextEntry?: boolean;
    value?: string;
    placeholderTextColor?: string;
    editable?: boolean;
    label?: string;
    multiline?: boolean;
    numberOfLines?: number;
    returnKeyType?: TextInputProps['returnKeyType'];
    inputRef?: React.LegacyRef<TextInput>;
    autoFocus?: boolean;
    autoCompleteType?: TextInputProps['autoCompleteType'];
    keyboardType?: TextInputProps['keyboardType'];
    autoCorrect?: TextInputProps['autoCorrect'];
    autoCapitalize?: TextInputProps['autoCapitalize'];
    textContentType?: TextInputProps['textContentType'];
    skipBlurOnSubmit?: boolean;
    onSubmit?: () => void;
    onTouchStart?: () => void;
    onBlur?: TextInputProps['onBlur'];
}

@observer
export default class Input extends React.Component<ITextInputProps> {
    _onChange = (v: string) => {
        if (this.props.model) {
            this.props.model.value = v;
        }
    };

    _onFocus = () => {
        if (this.props.model) {
            this.props.model.focused = true;
        }
    };

    _onBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        const { model, onBlur } = this.props;

        if (model) {
            model.focused = false;
        }

        if (onBlur) {
            onBlur(e);
        }
    };

    _onSubmit = () => {
        if (this.props.onSubmit) {
            this.props.onSubmit();
        }
    };

    render() {
        const {
            model,
            styleInput,
            styleWrap,
            styleError,
            styleLabel,
            placeholder,
            secureTextEntry,
            placeholderTextColor,
            forceError,
            editable,
            onTouchStart,
            value,
            label,
            multiline,
            numberOfLines,
            returnKeyType,
            inputRef,
            autoFocus,
            autoCompleteType,
            keyboardType,
            autoCorrect,
            autoCapitalize,
            textContentType,
            skipBlurOnSubmit,
        } = this.props;

        const errorText = model?.error || forceError;

        return (
            <View style={[styles.wrap, styleWrap]}>
                <TextInput
                    autoCorrect={autoCorrect}
                    ref={inputRef}
                    onSubmitEditing={this._onSubmit}
                    returnKeyType={returnKeyType || 'done'}
                    onChangeText={this._onChange}
                    value={model?.value || value}
                    onFocus={this._onFocus}
                    onBlur={this._onBlur}
                    placeholder={placeholder}
                    blurOnSubmit={!skipBlurOnSubmit}
                    autoCapitalize={autoCapitalize}
                    multiline={multiline}
                    autoFocus={autoFocus}
                    autoCompleteType={autoCompleteType}
                    keyboardType={keyboardType}
                    numberOfLines={numberOfLines}
                    placeholderTextColor={
                        placeholderTextColor || Colors.inputPlaceholder
                    }
                    style={[
                        styles.default,
                        TextStyles.h2,
                        { color: Colors.inputText },
                        styleInput,
                    ]}
                    secureTextEntry={secureTextEntry}
                    editable={editable}
                    onTouchStart={onTouchStart}
                    textContentType={textContentType}
                />
                {label && (
                    <Text
                        style={[
                            TextStyles.labelMedium,
                            styles.label,
                            styleLabel,
                        ]}>
                        {label}
                    </Text>
                )}
                {!!errorText && (
                    <Text
                        style={[
                            TextStyles.labelMedium,
                            styles.errorText,
                            styleError,
                        ]}>
                        {errorText}
                    </Text>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    wrap: {
        position: 'relative',
        width: '100%',
        justifyContent: 'center',
        textAlign: 'center',
    },
    default: {
        borderWidth: 0,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        textAlignVertical: 'center',
        textAlign: 'center',
    },
    label: {
        textAlign: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    errorText: {
        left: 0,
        width: '100%',
        textAlign: 'center',
        justifyContent: 'center',
        color: Colors.inputErrorText,
        marginTop: 16,
    },
});
