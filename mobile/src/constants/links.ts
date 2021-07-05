import { Linking } from 'expo';
import { Alert } from 'react-native';

export const OpenEmailClient = 'message:';

export async function tryOpenLink(url: string = OpenEmailClient, alert = true) {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
        Linking.openURL(url);
        return true;
    } else if (alert) {
        Alert.alert(
            'Error',
            "We wasn't able to open the link. Possibly, it hasn't been configured in your system.",
        );
        return false;
    }
}
