import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import Colors from 'src/constants/colors';
import Layout from 'src/constants/Layout';
import TextStyles from 'src/styles/TextStyles';
import { ITipItem, TipTypes } from 'src/viewModels/components/TipItemViewModel';
import InfoIcon from 'src/assets/images/info-icon.svg';
import PlusIcon from 'src/assets/images/plus-icon.svg';
import ShareIcon from 'src/assets/images/share-icon.svg';

function getTipIcon(type: TipTypes) {
    switch (type) {
        case 'check-in':
        case 'assessment': {
            return <PlusIcon width={16} height={16} />;
        }

        default: {
            return <InfoIcon width={16} height={16} />;
        }
    }
}

function getIconTitle(item: ITipItem) {
    switch (item.type) {
        case 'staticTip': {
            return item.staticTipType;
        }

        case 'interventionTip': {
            return 'tip';
        }

        case 'docLinkTip': {
            return 'link';
        }

        default: {
            return item.type;
        }
    }
}

export default function TipItemCard(props: { item: ITipItem, onPress: () => void }) {
    const { onPress, item } = props;
    const { type, title } = item;

    const isExternal = (item.type === 'staticTip' || item.type === 'docLinkTip') && !!item.url;

    return (
        <TouchableOpacity onPress={onPress}>
            <View style={[styles.card]}>
                <Text
                    numberOfLines={2}
                    style={[!Layout.isSmallDevice ? TextStyles.p1 : TextStyles.p3, styles.cardTitle]}
                >
                    {title}
                </Text>
                <View style={styles.footing}>
                    <View style={styles.type}>
                        {getTipIcon(type)}
                        <Text style={[TextStyles.labelMedium, styles.typeText]}>
                            {getIconTitle(props.item)}
                        </Text>
                    </View>
                    {isExternal && <ShareIcon width={12} height={12} />}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        position: 'relative',
        borderRadius: 5,
        backgroundColor: Colors.tipCardBg,
        paddingHorizontal: 24,
        paddingVertical: 20,
        width: Layout.getViewWidth(89.3),
        height: Layout.isSmallDevice ? 112 : 132,
        marginRight: 12,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexDirection: 'column',
        flexShrink: 0,
    },
    type: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typeText: {
        marginLeft: 8,
        color: Colors.tipCardInfo,
    },
    cardTitle: {
        color: Colors.tipCardTitle,
    },
    footing: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
});