import { TrackerEvent } from 'common/services/analytics/tracker';

function dashboardEvent(action: string, label: string = null, value: string = null): TrackerEvent {
    return {
        category: 'dashboard',
        action,
        label,
        value,
    };
}

export const Signup = dashboardEvent('signup');
export const Login = dashboardEvent('login');
export const Logout = dashboardEvent('logout');
export const AddClient = dashboardEvent('add_client');
export const Overview = (clientName: string) => dashboardEvent('overview', clientName);
export const Journal = (clientName: string) => dashboardEvent('journal', clientName);
export const Sessions = (clientName: string) => dashboardEvent('sessions', clientName);
export const Play = (pageName: string, clientName: string) => dashboardEvent('play', pageName, clientName);
export const SessionUpload = (clientName: string, sessionName: string) => dashboardEvent('session_upload', clientName, sessionName);