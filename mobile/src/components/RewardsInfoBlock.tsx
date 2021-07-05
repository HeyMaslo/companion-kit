import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getNumberSuffix } from 'common/utils/mathx';
import { Container } from 'src/components';
import TextStyles from 'src/styles/TextStyles';
import { RewardsViewModel } from 'src/viewModels/RewardsViewModel';
import ConcentricCircles, {
    ConcentricCirclesStyles,
} from './ConcentricCircles';

import FireIcon from 'src/assets/images/app/fire-icon.svg';
import { observer } from 'mobx-react';

type Props = {
    model: RewardsViewModel;
    concentricCirclesStyles: ConcentricCirclesStyles;
};

export const RewardsInfoBlock = observer((props: Props) => {
    const { model, concentricCirclesStyles } = props;
    const { level, streak } = model;

    const levelStr = `${level}${getNumberSuffix(level)} level`;
    const checkisCountStr =
        model.nextLevelCount >= model.currentCheckInsCount
            ? `${model.currentCheckInsCount}/${model.nextLevelCount} check-ins`
            : `${model.currentCheckInsCount} check-ins`;

    return (
        <Container style={styles.rewardInfoWrap}>
            <View style={styles.rewardInfo}>
                <ConcentricCircles
                    styles={concentricCirclesStyles}
                    model={model}
                />
                <View>
                    <Text style={[TextStyles.p1, styles.checkinsNumber]}>
                        {checkisCountStr}
                    </Text>
                    <Text style={[TextStyles.p3, styles.level]}>
                        {levelStr}
                    </Text>
                    {streak ? (
                        <View style={styles.streakWrap}>
                            <Text
                                style={[
                                    TextStyles.labelMedium,
                                    styles.streak,
                                ]}>{`${streak} day streak`}</Text>
                            <FireIcon style={styles.fireIcon} />
                        </View>
                    ) : null}
                </View>
            </View>
        </Container>
    );
});

const styles = StyleSheet.create({
    rewardInfoWrap: {
        marginBottom: 48,
    },
    rewardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingVertical: 24,
        backgroundColor: '#39309C',
        borderRadius: 8,
        height: 160,
    },
    checkinsNumber: {
        color: '#F0F1FF',
        marginBottom: 2,
    },
    level: {
        color: '#AAABD6',
    },
    streakWrap: {
        marginTop: 17,
        flexDirection: 'row',
        alignItems: 'center',
    },
    streak: {
        marginRight: 8,
    },
    fireIcon: {
        width: 14,
        height: 14,
    },
});
