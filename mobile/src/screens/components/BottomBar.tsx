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

    const ArchiveIcon: JSX.Element = <Images.activeArchiveIcon width={iconSize} height={iconSize} color={theme.colors.foreground} />;
    const HomeIcon: JSX.Element = screen === 'home' ? <Images.homeIcon width={iconSize} height={iconSize} color={theme.colors.highlight} /> : <Images.homeIcon width={iconSize} height={iconSize} color={theme.colors.foreground} />;
    const ProfileIcon: JSX.Element = screen === 'profile' ? <Images.activeProfileIcon width={iconSize} height={iconSize} color={theme.colors.highlight} /> : <Images.profileIcon width={iconSize} height={iconSize} color={theme.colors.foreground} />;
    // const SettingsIcon: React.ComponentClass<SvgProps, any> = screen === 'settings' ? Images.settingsIconActive : Images.settingsIcon;

    return (
        <View style={[BaseStyles.container, styles.container, { backgroundColor: backgroundColor }]}>
            <TouchableOpacity style={styles.button} onPress={() => GlobalTrigger(GlobalTriggers.QolHistory)}>
                {ArchiveIcon}
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
