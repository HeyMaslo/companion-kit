import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from 'src/constants/colors';
import AddStoryButton from 'src/components/AddStoryButton';
import { GlobalTrigger, GlobalTriggers } from 'src/stateMachine/globalTriggers';
import Images from 'src/constants/images';
import { SvgProps } from 'react-native-svg';
import BaseStyles from 'src/styles/BaseStyles';
import Layout from 'src/constants/Layout';
import AppViewModel from 'src/viewModels';

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
};

export default function BottomBar(props: Props) {
    const { screen } = props;
    const backgroundColor = screen === 'home' ? Colors.home.bg : Colors.pageBg;
    const showIndicator =
        process.appFeatures.GOALS_ENABLED &&
        AppViewModel.Instance.Goals.activeGoals.length > 0;

    const getGoalsIcon = () => {
        const goalsScreen = screen === 'goals';
        if (showIndicator) {
            return goalsScreen
                ? Images.goalsIndicatorActive
                : Images.goalsIndicator;
        }
        return goalsScreen ? Images.goalsActive : Images.goals;
    };

    const ArchiveIcon: React.ComponentClass<SvgProps, any> =
        screen === 'home' ? Images.activeArchiveIcon : Images.archiveIcon;
    const ProfileIcon: React.ComponentClass<SvgProps, any> =
        screen === 'profile' ? Images.activeProfileIcon : Images.profileIcon;
    const SettingsIcon: React.ComponentClass<SvgProps, any> =
        screen === 'settings' ? Images.settingsIconActive : Images.settingsIcon;
    const GoalsIcon: React.ComponentClass<SvgProps, any> = getGoalsIcon();

    const iconSize = process.appFeatures.GOALS_ENABLED ? 32 : 28;

    return (
        <View
            style={[
                BaseStyles.container,
                styles.container,
                { backgroundColor: backgroundColor },
            ]}>
            <TouchableOpacity
                style={styles.button}
                onPress={() => GlobalTrigger(GlobalTriggers.Home)}>
                <ArchiveIcon
                    width={iconSize}
                    height={iconSize}
                    color={'#000000'}
                />
            </TouchableOpacity>
            {process.appFeatures.GOALS_ENABLED ? (
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => GlobalTrigger(GlobalTriggers.Goals)}>
                    <GoalsIcon width={iconSize} height={iconSize} />
                </TouchableOpacity>
            ) : null}
            <AddStoryButton
                width={55}
                height={55}
                onPress={() => GlobalTrigger(GlobalTriggers.CreateStory)}
            />
            <TouchableOpacity
                style={styles.button}
                onPress={() => GlobalTrigger(GlobalTriggers.Profile)}>
                <ProfileIcon width={iconSize} height={iconSize} />
            </TouchableOpacity>
            {process.appFeatures.GOALS_ENABLED ? (
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => GlobalTrigger(GlobalTriggers.Settings)}>
                    <SettingsIcon width={iconSize} height={iconSize} />
                </TouchableOpacity>
            ) : null}
        </View>
    );
}
