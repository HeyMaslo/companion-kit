import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AddStoryButton from 'src/components/AddStoryButton';
import { GlobalTrigger, GlobalTriggers } from 'src/stateMachine/globalTriggers';
import Images from 'src/constants/images';
import { SvgProps } from 'react-native-svg';
import BaseStyles from 'src/styles/BaseStyles';
import Layout from 'src/constants/Layout';
import AppViewModel from 'src/viewModels';
import { Theme } from 'src/constants/theme/PStheme';

const HPadding = () => {
    if (process.appFeatures.GOALS_ENABLED) {
        return Layout.isSmallDevice ? 24 : 40;
    }
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
    screen?: 'home' | 'goals' | 'profile' | 'settings';
    theme: Theme;
};

export default function BottomBar(props: Props) {
    const { screen, theme } = props;
    const backgroundColor = theme.colors.background;
    const showIndicator = process.appFeatures.GOALS_ENABLED && AppViewModel.Instance.Goals.activeGoals.length > 0;

    const getGoalsIcon = () => {
        const goalsScreen = screen === 'goals';
        if (showIndicator) {
            return goalsScreen ? Images.goalsIndicatorActive : Images.goalsIndicator;
        }
        return goalsScreen ? Images.goalsActive : Images.goals;
    };

    const iconSize = process.appFeatures.GOALS_ENABLED ? 32 : 28;

    const ArchiveIcon: JSX.Element = <Images.activeArchiveIcon width={iconSize} height={iconSize} color={theme.colors.foreground} />;
    const HomeIcon: JSX.Element = screen === 'home' ? <Images.homeIcon width={iconSize} height={iconSize} color={theme.colors.highlight} /> : <Images.homeIcon width={iconSize} height={iconSize} color={theme.colors.foreground} />;
    const ProfileIcon: JSX.Element = screen === 'profile' ? <Images.activeProfileIcon width={iconSize} height={iconSize} color={theme.colors.highlight} /> : <Images.profileIcon width={iconSize} height={iconSize} color={theme.colors.foreground} />;
    const SettingsIcon: React.ComponentClass<SvgProps, any> = screen === 'settings' ? Images.settingsIconActive : Images.settingsIcon;

    const GoalsIcon: React.ComponentClass<SvgProps, any> = getGoalsIcon(); // not used by us

    return (
        <View style={[BaseStyles.container, styles.container, { backgroundColor: backgroundColor }]}>
            <TouchableOpacity style={styles.button}>
                {ArchiveIcon}
            </TouchableOpacity>
            {process.appFeatures.GOALS_ENABLED ?
                <TouchableOpacity style={styles.button} onPress={() => GlobalTrigger(GlobalTriggers.Goals)}>
                    <GoalsIcon width={iconSize} height={iconSize} color={'#000000'} />
                </TouchableOpacity>
                : null}
            <TouchableOpacity style={styles.button} onPress={() => GlobalTrigger(GlobalTriggers.Home)}>
                {HomeIcon}
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => GlobalTrigger(GlobalTriggers.Profile)}>
                {ProfileIcon}
            </TouchableOpacity>
            {process.appFeatures.GOALS_ENABLED ?
                <TouchableOpacity style={styles.button} onPress={() => GlobalTrigger(GlobalTriggers.Settings)}>
                    <SettingsIcon width={iconSize} height={iconSize} />
                </TouchableOpacity>
                : null}
        </View>
    );
}
