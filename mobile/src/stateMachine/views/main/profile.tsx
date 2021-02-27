import React from 'react';
import { ViewState } from '../base';
import { ScenarioTriggers } from '../../abstractions';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { observer } from 'mobx-react';
import TextStyles from 'src/styles/TextStyles';
import Colors from 'src/constants/colors';
import { CachedImage } from 'src/components/common/CachedImage';

import { Container, MasloPage } from 'src/components';
import BubbleChart, { Themes } from 'src/components/BubbleChart';
import { ProfileViewModel } from 'src/viewModels/ProfileViewModel';
import GradientChartBlock from 'src/screens/components/GradientChartBlock';
import BottomBar from 'src/screens/components/BottomBar';
import Localization from 'src/services/localization';
import Images from 'src/constants/images';

import { notch } from 'src/styles/BaseStyles';
import { PersonaScrollMask } from 'src/components/PersonaScollMask';
import { RewardsInfoBlock } from 'src/components/RewardsInfoBlock';
import { ConcentricCirclesStyles } from 'src/components/ConcentricCircles';
// import { PictureView } from '../pictureView';
// import { MediaTypeOptions } from 'expo-image-picker/build/ImagePicker.types';

type StatProps = {
    name: string;
    value: number;
};

// type State = {
//     capturingAvatar: boolean;
// };

function StatisticItem(props: StatProps) {
    return (
        <View style={styles.itemWrapper}>
            <Text style={TextStyles.h1}>{props.value}</Text>
            <Text style={[TextStyles.labelMedium, styles.subTextPrimary, { textTransform: 'uppercase' }]}>{props.name}</Text>
        </View>
    );
}

const UseAvatarMask = true;

const concentricCirclesStyles: ConcentricCirclesStyles = { diameter: 112, strokeBgColor: '#232685' };

@observer
export class ProfileView extends ViewState {
    constructor(props) {
        super(props);

        this._contentHeight = this.persona.setupContainerHeightForceScroll({ rotation: 180 });
    }

    // state = {
    //     capturingAvatar: false,
    // };

    private readonly model = new ProfileViewModel();

    async start() {
        // no-op
    }

    // changeAvatar = async () => {
    //     this.hidePersona();
    //     this.setState({ capturingAvatar: true });
    // }

    // saveAvatar = async () => {
    //     this.setState({ capturingAvatar: false });
    //     this.persona.setupContainerHeightForceScroll({ rotation: 405 });

    //     this.runLongOperation(this.model.saveImage);
    // }

    getPlaceholder() {
        return (
            <View style={styles.placeholder}>
                <Images.noStatistics width={258} height={145} />
                <Text style={[this.textStyles.h1, styles.placeholderHeading]}>No statistics yet</Text>
                <Text style={[this.textStyles.p1, styles.placeholderSubtitle]}>{`You haven’t created any check-ins recently.`}</Text>
            </View>
        );
    }

    renderContent() {
        const { model } = this;

        const noData = (model.totalJournals + model.totalSessions) === 0
            || (!model.gradientChart?.length && (!model.wordsWeekly || model.wordsWeekly.length === 0));

        const statsDividerMargin = model.totalSessions > 0 ? 25 : 50;

        return (
            <MasloPage style={styles.container}>
                {/* {capturingAvatar ? (
                    <PictureView
                        model={model.pictureViewVM}
                        onClose={() => this.setState({ capturingAvatar: false })}
                        pictureOptions={{
                            mediaTypes: MediaTypeOptions.Images,
                            allowsEditing: true,
                            allowsMultipleSelection: false,
                            aspect: [1, 1],
                        }}
                        afterShot={this.saveAvatar}
                    />
                ) : ( */}
                    <>
                        <Container style={styles.topBarWrapWrap}>
                            <PersonaScrollMask />
                            {!process.appFeatures.GOALS_ENABLED &&
                                <View style={styles.topBarWrap}>
                                    <TouchableOpacity onPress={() => this.trigger(ScenarioTriggers.Primary)} style={styles.settings}>
                                        <Images.settingsIcon width={16} height={16} />
                                    </TouchableOpacity>
                                </View>
                            }
                        </Container>
                        <ScrollView contentContainerStyle={styles.contentScrollView}>
                            {/* TOP BLOCK */}
                            <Container style={styles.contentContainer}>
                                <View style={styles.topBlock}>
                                    <View style={styles.avatarWrap}>
                                        {model.avatarURL ? (
                                            <CachedImage source={{ uri: model.avatarURL }} style={styles.avatar} />
                                        ) : (
                                            <Images.defaultAvatar style={[styles.avatar, styles.defaultAvatar]} />
                                        )}
                                        {UseAvatarMask && <Images.avatarMask width={80} height={80}/>}
                                        <TouchableOpacity style={styles.changePhoto} onPress={() => this.runLongOperation(this.model.saveImage)}>
                                            <Images.cameraIcon width={12} height={10} />
                                        </TouchableOpacity>
                                    </View>
                                    <View>
                                        <Text numberOfLines={2} style={[this.textStyles.h3, styles.name]}>{model.name}</Text>
                                    </View>
                                </View>

                                <View style={styles.stats}>
                                    <StatisticItem name="CHECK-INS" value={model.totalJournals} />
                                    <View style={[styles.divider, { marginHorizontal: statsDividerMargin }]} />
                                    <StatisticItem name="WORDS" value={model.totalWordsLength} />
                                    {model.totalSessions > 0 && (
                                        <>
                                            <View style={[styles.divider, { marginHorizontal: statsDividerMargin }]} />
                                            <StatisticItem name="SESSIONS" value={model.totalSessions} />
                                        </>
                                    )}
                                </View>
                            </Container>

                            {process.appFeatures.CLIENT_REWARDS_ENABLED &&
                                <RewardsInfoBlock
                                    model={model.rewardInfoBlockVM}
                                    concentricCirclesStyles={concentricCirclesStyles}
                                />
                            }

                            { noData ? (
                                this.getPlaceholder()
                            ) : (
                                <>
                                    { !model.gradientChart?.length ? null : <GradientChartBlock gradientChart={model.gradientChart} />}
                                    {/* BUBBLE CHART */}
                                    {model.wordsWeekly && model.wordsWeekly.length > 0 ? (
                                        <Container style={styles.bubbleChartWrap}>
                                            <Text style={[this.textStyles.h3, styles.mb20, styles.subTextPrimary]}>
                                                What is going on <Text style={styles.subTextSecondary}>this week</Text>
                                            </Text>
                                            <BubbleChart
                                                data={model.wordsWeekly}
                                                height={305}
                                                theme={Themes.dark}
                                            />
                                        </Container>
                                    ) : null}
                                </>
                            )}
                            {!process.appFeatures.MOBILE_STANDALONE && (
                                <Container>
                                    <View style={styles.coachBlock}>
                                        {model.coachAvatarUrl ? (
                                            <CachedImage source={{ uri: model.coachAvatarUrl }} style={styles.coachBlockAvatar} />
                                        ) : (
                                            <Images.defaultAvatar style={styles.coachBlockAvatar} />
                                        )}
                                        <View style={styles.coachBlockText}>
                                            <Text style={[this.textStyles.labelSmall, styles.transformUppercase, styles.subTextPrimary]}>
                                                Your {Localization.Current.MobileProject.dashboardEssence}
                                            </Text>
                                            <Text style={[this.textStyles.labelSmall, styles.transformUppercase]}>
                                                {model.coachName}
                                            </Text>
                                        </View>
                                    </View>
                                </Container>
                            )}
                        </ScrollView>
                        <BottomBar screen={'profile'} />
                    </>
                {/* )} */}
            </MasloPage>
        );
    }
}

// TODO too much styles?
const styles = StyleSheet.create({
    topBarWrapWrap: {
        position: 'absolute',
        top: 0,
        width: '100%',
        zIndex: 2,
        elevation: 2,
    },
    topBarWrap: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 72,
        zIndex: 2,
        elevation: 2,
    },
    contentScrollView: {
        minHeight: '100%',
        justifyContent: 'flex-start',
        paddingBottom: 144,
    },
    container: {
        justifyContent: 'flex-start',
    },
    contentContainer: {
        width: '100%',
    },
    topBlock: {
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: !notch ? 156 : 170,
        marginBottom: 32,
    },
    name: {
        justifyContent: 'center',
        textAlign: 'left',
    },
    changePhoto: {
        position: 'absolute',
        right: 0,
        bottom: -5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: 32 / 2,
        backgroundColor: Colors.profile.changePhoto.photoBg,
        borderWidth: 1,
        borderColor: Colors.profile.changePhoto.border,
    },
    desc: {
        textAlign: 'center',
    },
    inputWrap: {
        marginTop: 25,
    },
    avatar: {
        height: 75,
        width: 75,
        position: !UseAvatarMask ? 'relative' : 'absolute',
        top: 3,
        left: 1,
        borderRadius: 75 / 2,
    },
    defaultAvatar: {
        width: 75,
        height: 75,
        top: 3,
        left: 1,
        borderRadius: 75 / 2,
    },
    avatarWrap: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingRight: 8,
        marginBottom: 56,
    },
    subTextPrimary: {
        color: Colors.profile.subTextPrimaryColor,
    },
    subTextSecondary: {
        color: Colors.profile.subTextSecondaryColor,
    },
    goals: {
        marginBottom: 35,
    },
    mb20: {
        marginBottom: 20,
    },
    bubbleChartWrap: {
        marginTop: 40,
    },
    avatarMask: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    version: {
        textAlign: 'center',
        marginBottom: 20,
    },
    placeholder: {
        width: '100%',
        alignItems: 'center',
        textAlign: 'center',
    },
    placeholderHeading: {
        marginTop: 16,
        marginBottom: 12,
    },
    placeholderSubtitle: {
        textAlign: 'center',
        maxWidth: '90%',
        marginVertical: 0,
        marginHorizontal: 'auto',
        color: Colors.secondarySubtitle,
    },
    itemWrapper: {
        textAlign: 'center',
        alignItems: 'center',
    },
    settings: {
        // position: 'absolute',
        // top: !hasNotch() ? 24 : 52,
        // right: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: 4,
        backgroundColor: Colors.profile.settingsBg,
    },
    coachBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: 48,
    },
    coachBlockAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    coachBlockText: {
        textTransform: 'uppercase',
        justifyContent: 'space-between',
        height: 27,
    },
    transformUppercase: {
        textTransform: 'uppercase',
    },
    divider: {
        height: 32,
        width: 1,
        backgroundColor: Colors.borderColor,
    },
});
