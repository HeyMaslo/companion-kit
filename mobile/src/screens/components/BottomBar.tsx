import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { GlobalTrigger, GlobalTriggers } from 'src/stateMachine/globalTriggers';
import Images from 'src/constants/images';
import { SvgProps } from 'react-native-svg';
import BaseStyles from 'src/styles/BaseStyles';
import Layout from 'src/constants/Layout';
import AppViewModel from 'src/viewModels';
import { Theme } from 'src/constants/theme/PStheme';

const HPadding = () => {
    return 50;
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: HPadding(),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        zIndex: 100,
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

type Props = {
    screen?: 'home' | 'profile';
    theme: Theme;
};

export default function BottomBar(props: Props) {
    const { screen, theme } = props;
    const backgroundColor = theme.colors.background;

    const iconSize = 28;

    const HistoryIcon: JSX.Element = <Images.activeArchiveIcon width={iconSize} height={iconSize} color={theme.colors.midground} />;
    const HomeIcon: JSX.Element = <Images.homeIcon width={iconSize} height={iconSize} color={screen === 'home' ? theme.colors.highlight : theme.colors.midground} />;
    const ProfileIcon: JSX.Element = <Images.activeProfileIcon width={iconSize} height={iconSize} color={screen === 'profile' ? theme.colors.highlight : theme.colors.midground} />;
    // const SettingsIcon: React.ComponentClass<SvgProps, any> = screen === 'settings' ? Images.settingsIconActive : Images.settingsIcon;

    return (
        <View style={[BaseStyles.container, styles.container, { backgroundColor: backgroundColor }]}>
            <TouchableOpacity style={styles.button} onPress={() => GlobalTrigger(GlobalTriggers.QolHistory)}>
                {HistoryIcon}
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => GlobalTrigger(GlobalTriggers.Home)}>
                {HomeIcon}
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => GlobalTrigger(GlobalTriggers.Profile)}>
                {ProfileIcon}
            </TouchableOpacity>
        </View>
    );
}
