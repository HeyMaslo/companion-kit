import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import Layout from 'src/constants/Layout';
import TextStyles from 'src/styles/TextStyles';
import { ITipItem, TipTypes } from 'src/viewModels/components/TipItemViewModel';
import InfoIcon from 'src/assets/images/info-icon.svg';
import PlusIconInCircle from 'src/assets/images/plus-icon.svg';
import ShareIcon from 'src/assets/images/share-icon.svg';
import { Theme } from 'src/constants/theme/PStheme';

function getTipIcon(type: TipTypes, theme: Theme) {
    switch (type) {
        case 'check-in':
        case 'assessment':
        case 'finish-qol':
        case 'full-qol':
        case 'short-qol': {
            return <PlusIconInCircle width={16} height={16} color={theme.colors.tint} />;
        }

        default: {
            return <InfoIcon width={16} height={16} color={theme.colors.tint} />;
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

export default function TipItemCard(props: { item: ITipItem, onPress: () => void, theme: Theme }) {
    const { onPress, item, theme } = props;
    const { type, title } = item;

    const isExternal = (item.type === 'staticTip' || item.type === 'docLinkTip') && !!item.url;

    return (
        <TouchableOpacity onPress={onPress}>
            <View style={[styles.card, { backgroundColor: theme.colors.highlight, }]}>
                <Text
                    numberOfLines={2}
                    style={[!Layout.isSmallDevice ? TextStyles.p1 : TextStyles.p3, { color: theme.colors.background }]}
                >
                    {title}
                </Text>
                <View style={styles.footing}>
                    <View style={styles.type}>
                        {getTipIcon(type, theme)}
                        <Text style={[TextStyles.labelMedium, styles.typeText, { color: theme.colors.tint }]}>
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
    },
    footing: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
});