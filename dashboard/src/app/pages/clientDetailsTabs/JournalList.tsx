import React, { ReactNode } from 'react';
import JournalAudioCard from './JournalAudioCard';
import JournalTextCard from './JournalTextCard';
import JournalPictureCard from './JournalPictureCard';
import { JournalItem, EntryFileType } from 'app/viewModels/ClientEntryItem';
import { View } from 'app/common/components';

export type CardProps = {
    model: JournalItem,
    clientId: string,
};

type Props = {
    activeId: string,
    list: readonly JournalItem[],
    clientId: string,
    className?: string,
};

function getCardCompoment(type: EntryFileType) {
    switch (type) {
        case 'audio': {
            return JournalAudioCard;
        }
        case 'image': {
            return JournalPictureCard;
        }
        default: {
            return JournalTextCard;
        }
    }
}

export default function JournalList(props: Props) {
    const { activeId, list, clientId, className } = props;

    return (
        <View className={className || ''}>
            {
                list.map(cardViewModel => {
                    const jid = cardViewModel.id;

                    const Card = getCardCompoment(cardViewModel.fileType);

                    return (
                        <Card
                            key={jid}
                            model={cardViewModel}
                            active={activeId === jid}
                            clientId={clientId}
                        />
                    );
                })
            }
        </View>
    );
}