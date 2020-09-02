import { URL } from 'url';
import { LinksSettings, ClientSettings } from 'server/services/config';
import { AdminLib } from 'server/services/admin';

if (!LinksSettings.ClientInvitationLink) {
    console.error('CLIENT_INVITATION_LINK is not set to firebase functions config!');
}

if (!LinksSettings.DashboardUrl) {
    console.error('DASHBOARD_URL is not set to firebase functions config!');
}

export function getClientInviteLink(params?: { [x: string]: string }) {
    const url = new URL(LinksSettings.ClientInvitationLink);
    if (params) {
        Object.keys(params).forEach(k => {
            url.searchParams.append(k, params[k]);
        });
    }

    return url.href;
}

export function getActionCodeSettings(continueUrl: string, isMobile: boolean) {
    const res: AdminLib.auth.ActionCodeSettings = {
        handleCodeInApp: true,
        url: continueUrl,
    };

    if (isMobile) {
        res.url = LinksSettings.ClientInvitationLink;
        res.android = {
            packageName: ClientSettings.mobile.android,
            installApp: true,
        };
        res.iOS = {
            bundleId: ClientSettings.mobile.ios,
        };
    }

    return res;
}

export function getDashboardLink() {
    return LinksSettings.DashboardUrl;
}

export function getFirebaseConsoleUserLink(userUid) {
    return LinksSettings.FirestoreUrl + `data~2Fusers~2F${userUid}`;
}
