import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import NotificationFeedbackType = Haptics.NotificationFeedbackType;
import ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle;

const ENABLE = Platform.OS === 'ios';

export function selection() {
    if (ENABLE) {
        Haptics.selectionAsync();
    }
}

export function impact(style?: ImpactFeedbackStyle) {
    if (ENABLE) {
        Haptics.impactAsync(style);
    }
}

export function notification(type?: NotificationFeedbackType) {
    if (ENABLE) {
        Haptics.notificationAsync(type);
    }
}

export { NotificationFeedbackType, ImpactFeedbackStyle };
