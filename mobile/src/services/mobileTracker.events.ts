import { TrackerEvent } from 'common/services/analytics/tracker';
import { Platform } from 'react-native';

function dashboardEvent(
    action: string,
    label: string = null,
    value: string = null,
): TrackerEvent {
    return {
        category: 'mobile_' + Platform.OS,
        action,
        label,
        value,
    };
}

export const Signup = dashboardEvent('signup');
export const Login = dashboardEvent('login');
export const Logout = dashboardEvent('logout');
export const PromptShuffle = dashboardEvent('prompt_shuffle');
export const RecordingCompleted = dashboardEvent('recording_completed');
export const RecordingStarted = dashboardEvent('recording_started');
export const SessionStarted = dashboardEvent('session_started');
export const FirstOpen = dashboardEvent('first_open');
