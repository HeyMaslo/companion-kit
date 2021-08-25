import React from 'react';
import { View, StyleSheet, TouchableOpacity, LayoutChangeEvent, LayoutRectangle } from 'react-native';
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
    badge: {
        position: 'absolute',
        backgroundColor: 'red',
        zIndex: 111,
    },
});

type Props = {
    screen?: 'home' | 'goals' | 'profile' | 'settings';
    showBadgeOn?: 'home' | 'profile';
};

interface BottomBarState {
    profileLayout: LayoutRectangle,
    bottomBarY: number,
}

export default class BottomBar extends React.Component<Props, BottomBarState> {

    private backgroundColor = this.props.screen === 'home' ? Colors.home.bg : Colors.pageBg;
    private showIndicator = process.appFeatures.GOALS_ENABLED && AppViewModel.Instance.Goals.activeGoals.length > 0;

    private getGoalsIcon = () => {
        const goalsScreen = this.props.screen === 'goals';
        if (this.showIndicator) {
            return goalsScreen ? Images.goalsIndicatorActive : Images.goalsIndicator;
        }
        return goalsScreen ? Images.goalsActive : Images.goals;
    };

    private ArchiveIcon: React.ComponentClass<SvgProps, any> = this.props.screen === 'home' ? Images.activeArchiveIcon : Images.archiveIcon;
    private ProfileIcon: React.ComponentClass<SvgProps, any> = this.props.screen === 'profile' ? Images.activeProfileIcon : Images.profileIcon;
    private SettingsIcon: React.ComponentClass<SvgProps, any> = this.props.screen === 'settings' ? Images.settingsIconActive : Images.settingsIcon;
    private GoalsIcon: React.ComponentClass<SvgProps, any> = this.getGoalsIcon();

    private iconSize = process.appFeatures.GOALS_ENABLED ? 32 : 28;

    constructor(props) {
        super(props);

        this.state = {
            profileLayout: { width: 0, height: 0, x: 0, y: 0, },
            bottomBarY: 0,
        };
    }

    onLayoutProfileIcon = (event: LayoutChangeEvent) => {
        this.setState({ profileLayout: event.nativeEvent.layout });
    }

    onLayoutBottomBar = (event: LayoutChangeEvent) => {
        this.setState({ bottomBarY: event.nativeEvent.layout.y });
    }

    render() {
        return (
            <>
                <View style={[BaseStyles.container, styles.container, { backgroundColor: this.backgroundColor }]} onLayout={this.onLayoutBottomBar}>
                    <TouchableOpacity style={styles.button} onPress={() => GlobalTrigger(GlobalTriggers.Home)}>
                        <this.ArchiveIcon width={this.iconSize} height={this.iconSize} color={'#000000'} />
                    </TouchableOpacity>
                    {process.appFeatures.GOALS_ENABLED ?
                        <TouchableOpacity style={styles.button} onPress={() => GlobalTrigger(GlobalTriggers.Goals)}>
                            <this.GoalsIcon width={this.iconSize} height={this.iconSize} />
                        </TouchableOpacity>
                        : null}
                    <AddStoryButton
                        width={55}
                        height={55}
                        onPress={() => GlobalTrigger(GlobalTriggers.CreateStory)}
                    />
                    <TouchableOpacity style={styles.button} onPress={() => GlobalTrigger(GlobalTriggers.Profile)} onLayout={this.onLayoutProfileIcon}>
                        <this.ProfileIcon width={this.iconSize} height={this.iconSize} />
                    </TouchableOpacity>
                    {process.appFeatures.GOALS_ENABLED ?
                        <TouchableOpacity style={styles.button} onPress={() => GlobalTrigger(GlobalTriggers.Settings)}>
                            <this.SettingsIcon width={this.iconSize} height={this.iconSize} />
                        </TouchableOpacity>
                        : null}
                </View>
                {this.props.showBadgeOn == 'profile' &&
                    <View style={[styles.badge, { width: this.iconSize / 2, height: this.iconSize / 2, borderRadius: this.iconSize / 4, top: this.state.bottomBarY + this.state.profileLayout.y - this.iconSize / 2, left: this.state.profileLayout.x + this.state.profileLayout.width - this.iconSize / 4 }]} />}
            </>
        );
    }
}
