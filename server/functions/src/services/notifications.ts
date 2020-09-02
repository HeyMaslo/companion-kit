import { Expo as ExpoClient, ExpoPushMessage, ExpoPushTicket, ExpoPushReceipt } from 'expo-server-sdk';
import { Repo } from 'server/services/db';
import { NotificationData, TokenInfo, NotificationStatus, AndroidChannels } from 'common/models/Notifications';
import { createLazy } from 'common/utils/lazy.light';

const Expo = createLazy(() => new ExpoClient());

export type NotificationSendData = {
    body: string,
    subtitle?: string,
    data?: NotificationData,
    displayInForeground?: boolean,
};

export type NotificationSendRequest = {
    uid: string,
    data: NotificationSendData,
};

type NotificationSendResponse<T = NotificationSendRequest> = {
    request: T,
    statuses: NotificationStatus[],
};

function convertSendData(token: string, data: NotificationSendData): ExpoPushMessage {
    const message: ExpoPushMessage = {
        to: token,
        sound: 'default',
        body: data.body,
        channelId: AndroidChannels.Default,
    };

    if (data.subtitle) {
        message.subtitle = data.subtitle;
    }

    if (data.data) {
        message.data = data.data;
    }

    if (data.displayInForeground === true) {
        (message as any)._displayInForeground = true;
    }

    return message;
}

async function getTokens(uid: string) {
    const settings = await Repo.Users.getAllLocalSettings(uid);
    const tokens = settings?.filter(s => !!s.notifications?.token)
        .map(s => <TokenInfo>({
            value: s.notifications.token,
            deviceId: s.id,
            isStandaloneDevice: s.deviceInfo?.isStandaloneDevice,
        }));
    return tokens;
}

async function clearToken(token: TokenInfo) {
    const settings = await Repo.Users.findLocalSetting(token.deviceId);
    await Promise.all(
        settings.filter(s => s.notifications?.token === token.value)
            .map(s => Repo.Users.updateLocalSettings(
                s.userId,
                s.deviceId,
                {
                    notifications: {
                        ...s.notifications,
                        token: null,
                    },
                },
            )));
}

type TokensMap = Record<string, TokenInfo[]>;
type MessagesSendPack = {
    messages: ExpoPushMessage[],
    statuses: NotificationStatus[],
};

export async function pushNotifications<T extends NotificationSendRequest = NotificationSendRequest>(
    requests: T[],
): Promise<NotificationSendResponse<T>[]> {
    // collect all tokens for all users
    const userIds = new Set<string>(requests.map(n => n.uid));
    const tokensByUser: TokensMap = { };
    await Promise.all(Array.from(userIds).map(async uid => {
        const tokens = await getTokens(uid);
        tokensByUser[uid] = tokens;
    }));

    // construct arrays for tracking push messages and their status
    // and then use it to return response for each request

    // 1 request => 1 response
    const responses: NotificationSendResponse<T>[] = [];

    // 1 request => few messages
    // 1 request => few statuses, 1 message => 1 status
    const messagesPacks: MessagesSendPack[] = [
        { messages: [], statuses: [] }, // standalone
        { messages: [], statuses: [] }, // non-standalone
        { messages: [], statuses: [] }, // old installs w/o standalone info
    ];

    requests.forEach(nr => {
        const resp: NotificationSendResponse<T> = {
            request: nr,
            statuses: [],
        };

        const tokens = tokensByUser[nr.uid];
        tokens.forEach(t => {
            const m = convertSendData(t.value, nr.data);
            const status: NotificationStatus = {
                receiptId: null,
                current: null,
                token: t,
            };

            const pack = t.isStandaloneDevice != null
                ? (t.isStandaloneDevice ? messagesPacks[0] : messagesPacks[1])
                : messagesPacks[2];

            pack.messages.push(m);
            pack.statuses.push(status);

            resp.statuses.push(status);
        });

        responses.push(resp);
    });

    const processPack = async (pack: MessagesSendPack) => {
        const tickets: ExpoPushTicket[] = [];
        const chunks = Expo.value.chunkPushNotifications(pack.messages);
        for (const chunk of chunks) {
            const ticketsChunk = await Expo.value.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketsChunk);
        }

        // mapped to messages
        await Promise.all(tickets.map((t, i) => updateStatus(pack.statuses[i], t)));
    };

    await Promise.all(messagesPacks.map(processPack));

    console.log('Notifications Service Processed:', responses);

    return responses;
}

async function updateStatus(status: NotificationStatus, ticket?: ExpoPushTicket, receipt?: ExpoPushReceipt) {
    if (!ticket && !receipt) {
        return;
    }

    if (ticket?.status === 'ok') {
        status.receiptId = ticket.id;
        status.current = 'enqueued';
        return;
    }

    if (receipt?.status === 'ok') {
        status.current = 'confirmed';
        return;
    }

    const details = ticket?.details || receipt?.details;
    if (details?.error === 'DeviceNotRegistered' || details?.error === 'InvalidCredentials') {
        status.current = 'invalidToken';
        await clearToken(status.token);
    } else {
        status.current = 'failed';
    }
}

export async function processStatuses(statuses: NotificationStatus[]) {
    if (!statuses?.length) {
        return;
    }

    const statusById: Record<string, NotificationStatus> = { };
    statuses
        .filter(s => s.current === 'enqueued' && s.receiptId)
        .forEach(s => {
            statusById[s.receiptId] = s;
        });

    const updateStatusPromises: Promise<void>[] = [];
    const ids = Object.keys(statusById);
    if (!ids.length) {
        return;
    }

    const chunks = Expo.value.chunkPushNotificationReceiptIds(ids);
    for (const chunk of chunks) {
        const receipts = await Expo.value.getPushNotificationReceiptsAsync(chunk);
        // tslint:disable-next-line: forin
        for (const id in receipts) {
            const receipt = receipts[id];
            if (!receipt) {
                continue;
            }

            const status = statusById[id];
            updateStatusPromises.push(updateStatus(status, null, receipt));
        }
    }

    await Promise.all(updateStatusPromises);
}
