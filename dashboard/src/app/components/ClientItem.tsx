import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { ClientStatus, ClientInviteMinPeriod, Moods } from 'common/models';
import View from 'app/common/components/View';
import Text from 'app/common/components/Text';
import ButtonColor from 'app/components/ButtonColor';
import ButtonArrow from 'app/components/ButtonArrow';
import Container from 'app/common/components/Container';
import History from 'app/services/history';
import Image from 'app/common/components/Image';
import * as Routes from 'app/constants/routes';
import { ClientItemViewModel } from 'app/viewModels/ClientsPageViewModel';
import ProjectImages from 'app/helpers/images';
import { weekDays, formatDate } from 'common/utils/dateHelpers';

type Props = {
    client: ClientItemViewModel,
};

const Colors: string[] = ['#43D8CF', '#43D8CF', '#FFC9B3', '#FFAFD5', '#FFAFD5'];

export const MoodColors: { [mood: number]: string } = {
    [Moods.Rough]: Colors[4],
    [Moods.Difficult]: Colors[3],
    [Moods.Mixed]: Colors[2],
    [Moods.Positive]:  Colors[1],
    [Moods.VeryPositive]:  Colors[0],
};

const ClientItem = observer((props: Props) => {
    const {
        client,
    } = props;

    const {
        renewClient, resendInvitation, promptToDeleteClient,
        displayName, lastCheckInDate, lastCheckInMood,
    } = client;
    const { status, goal, occupation } = client.card;

    // // Temporary for testing
    // console.log(
    //     'LAST CHECK-IN DATE',
    //     displayName,
    //     lastCheckInDate ? `${weekDays[new Date(lastCheckInDate).getDay()]}, ${new Date(lastCheckInDate).getDay()}`  : 'null',
    //     lastCheckInMood ? Moods.getTitle(lastCheckInMood) : 'null',
    // );

    let statusBlock: ReactNode = null;
    let actionBlock: ReactNode = null;
    const isActiveClient = client.card.status === ClientStatus.Active;

    const clientImage: string = client.avatarUrl || ProjectImages.AvatarPlaceholderClient;

    const checkinTextFormat = lastCheckInMood && lastCheckInDate
        ? `${Moods.getTitle(lastCheckInMood)} \u00B7 ${weekDays[new Date(lastCheckInDate).getDay()]}, ${formatDate(new Date(lastCheckInDate))}`
        : null;

    const checkinColor = lastCheckInMood ? MoodColors[Moods.findNearest(lastCheckInMood)] : null;

    switch (status) {
        case ClientStatus.Active: {
            actionBlock = (
                <ButtonArrow
                    // greenArrow
                    typeButton="primary"
                    title="view"
                    onClick={() => History.push(Routes.ClientDetails(client.id, Routes.ClientDetails.Tabs.overview))}
                    titleClassName="type4"
                />
            );
            statusBlock = (
                <>
                    <Text className={`label-btn2 type1 status-block-text ${status}`}>{status}</Text>
                </>
            );
            break;
        }

        case ClientStatus.Inactive: {
            actionBlock = (
                <>
                    <ButtonColor onClick={renewClient} titleClassName="type2" title="renew"/>
                    <View className="separator"/>
                    <ButtonColor onClick={promptToDeleteClient} titleClassName="type3" title="delete" />
                </>
            );
            statusBlock = (
                <>
                    <Text className={`label-btn2 type1 status-block-text ${status}`}>{status}</Text>
                </>
            );
            break;
        }

        case ClientStatus.Invited: {
            const canResend = new Date().getTime() - client.card.inviteSentTime >= ClientInviteMinPeriod;
            actionBlock = (
                <>
                    {canResend && (
                        <>
                            <ButtonColor onClick={resendInvitation} titleClassName="type2" title="invite again"/>
                            <View className="separator"/>
                        </>
                    )}
                    <ButtonColor onClick={() => History.push(Routes.ClientDetails(client.id, Routes.ClientDetails.Tabs.edit))} titleClassName="type4" title="edit" />
                </>
            );
            statusBlock = (
                <>
                    <Text className={`label-btn2 type1 status-block-text ${status}`}>{status}</Text>
                </>
            );
            break;
        }

        default: actionBlock = null;
    }

    return (
        <li
            onClick={() => {
                if (isActiveClient) {
                    History.push(Routes.ClientDetails(client.id, Routes.ClientDetails.Tabs.overview));
                }
            }}
            className={`client-item ${status}`}
        >
            <Container className="client-item-container">
                <Image className="client-item-image round" src={clientImage} />
                <View className="text-block">
                    <Text className="name desc-1">
                        {displayName}
                        {goal && occupation && <Text className="desc-1 type3">,&nbsp;{occupation}</Text>}
                    </Text>
                    { (checkinTextFormat && checkinColor) ? (
                        <View className="checkin-wrap">
                            <Text className="chekin-color" style={{ background: `${checkinColor}`}}/>
                            <Text className="chekin-text label-draganddrop up-text">{checkinTextFormat}</Text>
                        </View>
                    ) : null}
                </View>
                <View className="status-block">{statusBlock}</View>
                <View className="action-block">{actionBlock}</View>
            </Container>
        </li>
    );
});

export default ClientItem;
