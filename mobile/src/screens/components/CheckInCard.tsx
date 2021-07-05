import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CachedImage as Image } from 'src/components/common/CachedImage';
import Colors from 'src/constants/colors';
import Layout from 'src/constants/Layout';
import TextStyles from 'src/styles/TextStyles';
import CheckInViewModel from 'src/viewModels/CheckInViewModel';
import LockIcon from 'assets/images/lock-icon.svg';
import UnlockIcon from 'assets/images/unlock-icon.svg';
import Localization from 'src/services/localization';
import Images from 'src/constants/images';
import * as Features from 'common/constants/features';

type Props = {
    active: boolean;
    model: CheckInViewModel;
    onPress: () => void;
};

const CardHeight = Layout.isSmallDevice ? 174 : 208;

const PICTURE_CHECKINS_ENABLED =
    process.appFeatures.PICTURE_CHECKINS_ENABLED === true;

const CheckInCard = (props: Props) => {
    const { active, onPress } = props;
    const { mood, date, isPrivate, title } = props.model;

    const pictureUrl = PICTURE_CHECKINS_ENABLED
        ? props.model.imageUrl?.url
        : null;

    const ClockIcon = Images.clockIcon;

    return (
        <TouchableOpacity onPress={onPress}>
            <View style={[styles.card, active && styles.active]}>
                {pictureUrl ? (
                    <View style={styles.pictureBg}>
                        <View style={styles.pictureWrap}>
                            <Image
                                style={styles.picture}
                                source={{ uri: pictureUrl }}
                                resizeMode={'contain'}
                            />
                        </View>
                    </View>
                ) : (
                    <Text
                        numberOfLines={!Layout.isSmallDevice ? 4 : 3}
                        style={[
                            !Layout.isSmallDevice
                                ? TextStyles.p1
                                : TextStyles.p3,
                            styles.cardTitle,
                        ]}>
                        {title}
                    </Text>
                )}
                {Features.Mobile.CheckIns.AllowCheckinPrivateness && (
                    <View style={styles.privacy}>
                        {isPrivate ? (
                            <LockIcon width={18} height={18} />
                        ) : (
                            <UnlockIcon width={18} height={18} />
                        )}
                        <Text
                            style={[TextStyles.labelSmall, styles.privacyText]}>
                            {isPrivate
                                ? 'Private'
                                : `Visible to ${Localization.Current.MobileProject.dashboardEssence}`}
                        </Text>
                    </View>
                )}
                <View style={styles.date}>
                    <ClockIcon width={16} height={16} />
                    <Text style={[TextStyles.labelMedium, styles.dateText]}>
                        {date}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        position: 'relative',
        borderRadius: 5,
        backgroundColor: Colors.storyCard.bg,
        paddingHorizontal: 24,
        paddingVertical:
            PICTURE_CHECKINS_ENABLED && Layout.isSmallDevice ? 14 : 20,
        width: Layout.getViewWidth(70),
        height: CardHeight,
        marginRight: 10,
    },
    active: {},
    mood: {
        position: 'absolute',
        bottom: 24,
        right: 21,
        width: 40,
        height: 40,
    },
    date: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 'auto',
    },
    dateText: {
        marginLeft: 8,
        color: Colors.storyCard.date,
    },
    cardTitle: {
        color: Colors.storyCard.title,
    },
    privacy: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: 18,
    },
    privacyText: {
        textTransform: 'uppercase',
        display: 'flex',
        marginLeft: 16,
        color: Colors.storyCard.privacyText,
    },
    pictureBg: {
        alignContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: Layout.isSmallDevice ? 44 : 56,
        backgroundColor: '#7375AD',
        zIndex: 1,
        elevation: 1,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        paddingVertical: Layout.isSmallDevice ? 12 : 16,
        paddingHorizontal: Layout.isSmallDevice ? 30 : 40,
    },
    pictureWrap: {
        alignContent: 'center',
        alignItems: 'center',
        width: 180,
        height: Layout.isSmallDevice ? 108 : 120,
        borderRadius: 5,
        overflow: 'hidden',
    },
    picture: {
        width: '100%',
        height: '100%',
    },
});

export default observer(CheckInCard);
