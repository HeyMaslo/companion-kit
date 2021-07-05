import { ViewState } from '../base';
import { ScenarioTriggers } from '../../abstractions';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { CachedImage as Image } from 'src/components/common/CachedImage';
import Switch from 'dependencies/react-native-switch-pro';
import TextStyles, { mainFontThin } from 'src/styles/TextStyles';
import Colors from 'src/constants/colors';
import {
    MasloPage,
    Container,
    Button,
    AudioPlayer,
    ActivityButton,
} from 'src/components';
import BubbleChart, { Themes } from 'src/components/BubbleChart';
import BottomBar from 'src/screens/components/BottomBar';
import { MoodImages } from 'src/helpers/mood';
import EnvConstants from 'src/constants/env';
import Localization from 'src/services/localization';
import Moods from 'common/models/Moods';
import Layout from 'src/constants/Layout';
import { PersonaScrollMask } from 'src/components/PersonaScollMask';
import * as Features from 'common/constants/features';
import CheckInViewModel from 'src/viewModels/CheckInViewModel';

import Images from 'src/constants/images';
import DeleteIcon from 'src/assets/images/delete-icon.svg';
import Locked from 'src/assets/images/lock-icon.svg';
import Unlocked from 'src/assets/images/unlock-icon.svg';

type CardProps = {
    title: string;
    label: string;
    icon: JSX.Element;
    numberOfLines?: number;
    titleStyle?: any;
};

// TODO reuse this card on settings screen ?
function Card(props: CardProps) {
    const { title, label, icon, numberOfLines, titleStyle } = props;

    return (
        <View style={styles.card}>
            <Container style={styles.cardContainer}>
                <View style={styles.cardIcon}>{icon}</View>
                <View>
                    <Text style={[TextStyles.labelMedium, styles.cardLabel]}>
                        {label}
                    </Text>
                    <Text
                        lineBreakMode="tail"
                        numberOfLines={numberOfLines || 1}
                        style={[
                            TextStyles.h1,
                            styles.cardTitle,
                            !numberOfLines && { textTransform: 'capitalize' },
                            titleStyle || null,
                        ]}>
                        {title}
                    </Text>
                </View>
            </Container>
        </View>
    );
}

export type CheckInDetailsParams = {
    id: string;
};

type State = {
    transcriptionIsOpened: boolean;
    showButton: boolean;
};

@observer
export class CheckInDetailsView extends ViewState<State, CheckInDetailsParams> {
    private readonly model = new CheckInViewModel();

    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScroll({
            rotation: 405,
        });
    }

    state = {
        transcriptionIsOpened: false,
        showButton: false,
    };

    protected start() {
        const id = this.params?.id;
        this.logger.log('Opening check in details view, id =', id);

        this.model.setCheckInId(id).updateAudioUrl();
    }

    protected end() {
        this.model.clearModel();
        this.model.audioPlayer.reset();
    }

    private _onBackBtnPress = () => {
        this.model.audioPlayer.reset();
        this.trigger(ScenarioTriggers.Back);
    };

    private _onDeleteBtnPress = () => {
        if (this.model.audioPlayer.isPlaying) {
            this.model.audioPlayer.reset();
        }

        this.showModal({
            title: 'Do you really want to delete this entry?',
            primaryButton: {
                text: 'yes, delete',
                action: async () => {
                    await this.model._deleteCheckInAsync();
                    this.trigger(ScenarioTriggers.Back);
                },
            },
            secondaryButton: {
                text: 'go back',
                action: null,
            },
        });
    };

    private _onExtendBtnPress = () => {
        this.setState({
            transcriptionIsOpened: !this.state.transcriptionIsOpened,
        });
    };

    private _measureTextHeight(event) {
        const threshold = 10;
        const linesLimit = 7;
        const textLineHeight = TextStyles.p2.lineHeight;
        const textElementHeight = event.nativeEvent.layout.height;
        if (textElementHeight > textLineHeight * linesLimit - threshold) {
            this.setState({
                showButton: true,
            });
        }
    }

    renderContent() {
        const {
            location,
            mood,
            date,
            question,
            transcription,
            audioPlayer,
            audioUrl,
            feelings,
            recommendedTips,
        } = this.model;
        const { transcriptionIsOpened, showButton } = this.state;
        const MoodIcon = MoodImages[mood];

        const pictureUrl =
            process.appFeatures.PICTURE_CHECKINS_ENABLED === true
                ? this.model.imageUrl?.url
                : null;

        const moodTitle = Moods.getTitle(mood);

        return (
            <MasloPage style={this.baseStyles.page}>
                <Container style={styles.topBarWrapWrap}>
                    <PersonaScrollMask />
                    <View style={styles.topBarWrap}>
                        <Button
                            style={styles.backBtn}
                            underlayColor="transparent"
                            onPress={this._onBackBtnPress}>
                            <Images.backIcon width={28} height={14} />
                        </Button>
                        {Features.Mobile.CheckIns.AllowCheckinDelete && (
                            <Button
                                style={styles.deleteBtn}
                                onPress={this._onDeleteBtnPress}>
                                <DeleteIcon width={15} height={19} />
                            </Button>
                        )}
                    </View>
                </Container>
                <ScrollView
                    style={[
                        {
                            zIndex: 0,
                            elevation: 0,
                            height: this._contentHeight,
                        },
                    ]}>
                    <Container style={styles.headingContainer}>
                        <View style={styles.date}>
                            <Images.clockIcon2 width={16} height={16} />
                            <Text
                                style={[
                                    this.textStyles.labelMedium,
                                    styles.dateText,
                                ]}>
                                {date}
                            </Text>
                        </View>
                        {pictureUrl ? (
                            <View style={styles.pictureCard}>
                                <View style={styles.pictureWrap}>
                                    <Image
                                        style={styles.picture}
                                        source={{ uri: pictureUrl }}
                                        resizeMode={'contain'}
                                    />
                                </View>
                            </View>
                        ) : (
                            <Text style={this.textStyles.p1}>{question}</Text>
                        )}
                    </Container>
                    <View style={[styles.cardsWrap]}>
                        <View style={styles.separator} />
                        <Card
                            title={moodTitle}
                            label="your mood was ..."
                            icon={
                                MoodIcon && <MoodIcon height={24} width={24} />
                            }
                        />
                        <View style={styles.separator} />
                        {Features.Mobile.CheckIns.AskCheckinLocation && (
                            <>
                                <Card
                                    title={location}
                                    label="you were ..."
                                    icon={
                                        <Images.pinIcon2
                                            height={24}
                                            width={24}
                                        />
                                    }
                                />
                                <View style={styles.separator} />
                            </>
                        )}
                        {audioUrl ? (
                            <View style={styles.card}>
                                <Container>
                                    <Text
                                        style={[
                                            this.textStyles.labelMedium,
                                            styles.cardLabel,
                                            styles.audioSubtitle,
                                        ]}>
                                        you describe it as ...
                                    </Text>
                                    <AudioPlayer
                                        style={styles.audioPlayer}
                                        model={audioPlayer}
                                    />
                                </Container>
                            </View>
                        ) : null}

                        {transcription ? (
                            <>
                                <View style={styles.card}>
                                    <Container style={styles.cardContainer}>
                                        <View style={styles.cardIcon}>
                                            <Images.describeIcon
                                                height={24}
                                                width={24}
                                            />
                                        </View>
                                        <View>
                                            <Text
                                                style={[
                                                    TextStyles.labelMedium,
                                                    styles.cardLabel,
                                                ]}>
                                                {'you describe it as ...'}
                                            </Text>
                                            <Text
                                                onLayout={(event) =>
                                                    this._measureTextHeight(
                                                        event,
                                                    )
                                                }
                                                lineBreakMode="tail"
                                                numberOfLines={
                                                    transcriptionIsOpened
                                                        ? null
                                                        : 7
                                                }
                                                style={[
                                                    this.textStyles.p2,
                                                    styles.cardTitle,
                                                ]}>
                                                {transcription}
                                            </Text>
                                        </View>
                                        {showButton && (
                                            <Button
                                                onPress={this._onExtendBtnPress}
                                                style={styles.extendButton}
                                                underlayColor={'transparent'}>
                                                <Text
                                                    style={[
                                                        this.textStyles
                                                            .labelMedium,
                                                        styles.extendButtonText,
                                                    ]}>{`show ${
                                                    transcriptionIsOpened
                                                        ? 'less'
                                                        : 'more'
                                                }`}</Text>
                                                <Images.buttonTriangle
                                                    width={8}
                                                    height={4}
                                                    style={{
                                                        transform: transcriptionIsOpened
                                                            ? [
                                                                  {
                                                                      rotate:
                                                                          '180deg',
                                                                  },
                                                              ]
                                                            : [],
                                                    }}
                                                />
                                            </Button>
                                        )}
                                    </Container>
                                </View>
                                <View style={styles.separator} />
                            </>
                        ) : null}
                        {feelings?.length > 0 && (
                            <>
                                <View style={styles.card}>
                                    <Container style={{ paddingLeft: 64 }}>
                                        <Text
                                            style={[
                                                this.textStyles.labelMedium,
                                                styles.cardLabel,
                                            ]}>
                                            You felt ...
                                        </Text>
                                        <View style={styles.list}>
                                            {feelings.map((feeling, i) => (
                                                <View
                                                    key={`${feeling}_${i}`}
                                                    style={styles.listItem}>
                                                    <Images.checkedIcon
                                                        style={
                                                            styles.listItemIcon
                                                        }
                                                    />
                                                    <Text
                                                        style={[
                                                            this.textStyles.p2,
                                                            styles.listItemText,
                                                        ]}>
                                                        {feeling}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </Container>
                                </View>
                                <View style={styles.separator} />
                            </>
                        )}
                        {recommendedTips?.length > 0 && (
                            <>
                                <View style={styles.card}>
                                    <Container style={{ paddingLeft: 64 }}>
                                        <Text
                                            style={[
                                                this.textStyles.labelMedium,
                                                styles.cardLabel,
                                            ]}>
                                            I recommended you ...
                                        </Text>
                                        <View style={styles.list}>
                                            {recommendedTips.map((tip, i) => (
                                                <View
                                                    key={`${tip.text}_${i}`}
                                                    style={styles.listItem}>
                                                    <Images.checkedIcon
                                                        style={
                                                            styles.listItemIcon
                                                        }
                                                    />
                                                    <Text
                                                        style={[
                                                            this.textStyles.p2,
                                                            styles.listItemText,
                                                        ]}>
                                                        {tip.text}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </Container>
                                </View>
                                <View style={styles.separator} />
                            </>
                        )}

                        {EnvConstants.AllowManualProcessing && (
                            <React.Fragment>
                                <View style={styles.separator} />
                                <ActivityButton
                                    title="Process"
                                    onPress={this.model.manualProcess}
                                    loading="promise"
                                />

                                {this.model.processResultDebug && (
                                    <Text>{this.model.processResultDebug}</Text>
                                )}
                            </React.Fragment>
                        )}

                        {this.model.recordEntities && (
                            <Container style={styles.chart}>
                                <BubbleChart
                                    data={this.model.recordEntities}
                                    height={this.layout.getViewHeight(53)}
                                    theme={Themes.dark}
                                />
                            </Container>
                        )}
                    </View>
                </ScrollView>
                <BottomBar />
            </MasloPage>
        );
    }
}

// TODO re-check styles
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
        justifyContent: 'space-between',
        height: 52,
        zIndex: 2,
        elevation: 2,
    },
    backBtn: {
        width: 52,
        height: 52,
        alignItems: 'flex-start',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    deleteBtn: {
        width: 52,
        height: 52,
        alignItems: 'flex-end',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    headingContainer: {
        paddingTop: Layout.getViewHeight(24),
        marginBottom: 40,
    },
    date: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    dateText: {
        marginLeft: 14,
    },
    separator: {
        width: '100%',
        height: 1,
        backgroundColor: Colors.borderColor,
    },
    card: {
        paddingVertical: 28,
    },
    cardContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
        paddingLeft: 64,
        position: 'relative',
    },
    cardLabel: {
        marginBottom: 4,
    },
    cardTitle: {
        fontFamily: mainFontThin,
        fontWeight: '200',
    },
    cardIcon: {
        position: 'absolute',
        top: 24,
        left: 24,
    },
    cardsWrap: {},
    audioPlayer: {
        marginBottom: 10,
    },
    audioSubtitle: {
        paddingLeft: 35,
    },
    chart: {
        paddingTop: 30,
        paddingBottom: 90,
    },
    privateToggleContainer: {
        position: 'relative',
    },
    switchStyles: {
        position: 'absolute',
        paddingHorizontal: 3,
        alignSelf: 'center',
        top: 23,
        right: 26,
    },
    list: {
        position: 'relative',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        width: Layout.getViewWidth(74),
        marginTop: 12,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    listItemText: {
        width: Layout.getViewWidth(68),
        marginTop: 0,
    },
    listItemIcon: {
        width: 8,
        height: 6,
        position: 'absolute',
        top: 10,
        left: -24,
    },
    extendButton: {
        flexBasis: '100%',
        marginTop: 16,
        height: 'auto',
        width: 'auto',
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    extendButtonText: {
        textTransform: 'uppercase',
        color: Colors.button.extendButtonText,
        marginRight: 6,
    },
    pictureCard: {
        alignContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: 200,
        backgroundColor: '#39309C',
        borderRadius: 8,
        paddingVertical: 24,
        paddingHorizontal: 50,
    },
    pictureWrap: {
        alignContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        borderRadius: 5,
        overflow: 'hidden',
    },
    picture: {
        width: '100%',
        height: '100%',
    },
});
