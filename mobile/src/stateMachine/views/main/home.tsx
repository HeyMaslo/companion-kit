import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, ScrollView, ActivityIndicator, View, Animated, GestureResponderEvent, TouchableNativeFeedback, Platform, Pressable } from 'react-native';
import TextStyles from 'src/styles/TextStyles';
import Colors from 'src/constants/colors';
import { Container, MasloPage, Placeholder, Button } from 'src/components';
import HomeViewModel from 'src/viewModels/HomeViewModel';
import BottomBar from 'src/screens/components/BottomBar';
import CheckInCard from 'src/screens/components/CheckInCard';
import TipItemCard from 'src/screens/components/TipCard';
import { CheckInDetailsParams } from 'src/stateMachine/views/main/checkInDetails';
import { ViewState } from '../base';
import { ScenarioTriggers, PersonaStates } from '../../abstractions';
import Layout from 'src/constants/Layout';
import * as Links from 'src/constants/links';
import { IInterventionTipItem, ITipItem } from 'src/viewModels/components/TipItemViewModel';
import { InterventionTipsStatuses, Identify, DocumentLinkEntry } from 'common/models';
import { TransitionObserver } from 'common/utils/transitionObserver';
import { UserProfileName } from 'src/screens/components/UserProfileName';
import AppViewModel from 'src/viewModels';
import { QolSurveyResults, QolSurveyType } from 'src/constants/QoL';
import { getPersonaRadius, PersonaScale } from 'src/stateMachine/persona';
import AppController from 'src/controllers'; // MK-TODO used for testing only
import { sum } from 'src/helpers/DomainHelper';
import { Portal } from 'react-native-paper';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const minContentHeight = 535;
const MaxHeight = Layout.isSmallDevice ? 174 : 208;
const personaScale = PersonaScale;

let isFirstLaunch = true;

@observer
export class HomeView extends ViewState<{ opacity: Animated.Value, isUnfinishedQol: boolean }> {

    private _linkDocModalShown = true;
    private ordRadius = getPersonaRadius();
    private orbTapContainerHeight = 0;
    state = {
        opacity: new Animated.Value(0),
        isUnfinishedQol: null,
    };

    constructor(props, ctx) {
        super(props, ctx);
        this.onTapOrb = this.onTapOrb.bind(this);
        const smallHeight = this.layout.window.height < 800;
        this.persona.state = PersonaStates.Idle;
        this._contentHeight = smallHeight
            ? this.persona.setupContainerHeightForceScroll({ rotation: 120, transition: { duration: 1.5 } })
            : this.persona.setupContainerHeight(minContentHeight, { rotation: 120, transition: { duration: 1.5 } });
        this.orbTapContainerHeight = Layout.window.height - this._contentHeight;
    }

    get viewModel() { return HomeViewModel.Instance; }
    get qolViewModel() { return AppViewModel.Instance.QOL; }

    async start() {
        await AppViewModel.Instance.QOL.init();
        this.persona.qolArmMagnitudes = await this.viewModel.getArmMagnitudes();
        this.setState({ ...this.state, isUnfinishedQol: AppViewModel.Instance.QOL.isUnfinished });
        Animated.timing(this.state.opacity, {
            toValue: 1,
            delay: isFirstLaunch ? 1000 : 400,
            duration: 500,
            useNativeDriver: true
        }).start(this.checkNewLinkDoc);
        isFirstLaunch = false;
        // MK-TODO is this the best place to do this? Good now for testing
        await AppViewModel.Instance.Domain.fetchPossibleDomains();
        AppViewModel.Instance.Domain.fetchSelectedDomains();
        await AppViewModel.Instance.Strategy.fetchPossibleStrategies();
        AppViewModel.Instance.Strategy.fetchSelectedStrategies();
    }

    private checkNewLinkDoc = () => {
        if (this.viewModel.newDocumentLink) {
            this.showNewDocumentLinkModal(this.viewModel.newDocumentLink);
        } else {
            this.disposer.add(
                new TransitionObserver(() => this.viewModel.newDocumentLink)
                    .cb(v => v ? this.showNewDocumentLinkModal(v) : this.hideNewDocumentLinkeModal()),
            );
        }
    }

    private showNewDocumentLinkModal(doc: Identify<DocumentLinkEntry>) {
        const measureTextHeight = () => {
            const linesLimit = 5;
            const textLineHeight = Layout.isSmallDevice ? TextStyles.p2.lineHeight : TextStyles.p1.lineHeight;
            const textElementHeight = textLineHeight * linesLimit + (textLineHeight / 2);

            return textElementHeight;
        };

        this._linkDocModalShown = true;

        this.showModal({
            title: 'New Link',
            message: (
                <View style={[styles.newLinkMsgBlock, { height: measureTextHeight() }]}>
                    <ScrollView>
                        <Text style={[Layout.isSmallDevice ? TextStyles.p2 : TextStyles.p1, styles.newLinkMsg]}>
                            <UserProfileName model={this.viewModel.coachProfile} placeholder={this.viewModel.coachName} /> sent you {doc.name}. Check it out!
                        </Text>
                    </ScrollView>
                </View>
            ),
            primaryButton: {
                text: 'Open Link',
                action: () => {
                    this.hideNewDocumentLinkeModal();
                    this.runLongOperation(() => this.viewModel.openDocumentLink(doc));
                },
            },
            onClose: () => {
                this.hideNewDocumentLinkeModal();
                this.viewModel.markLinkDocumentAsSeen(doc);
            },
        });
    }

    private hideNewDocumentLinkeModal() {
        if (this._linkDocModalShown) {
            this.hideModal();
        }
    }

    private onInTake = () => {
        this.trigger(ScenarioTriggers.Secondary);
    }

    private onAddCheckin = () => {
        this.trigger(ScenarioTriggers.Submit);
    }

    private onFinishQol = () => {
        this.trigger(ScenarioTriggers.Quaternary);
    }

    private onFullQol = () => {
        this.qolViewModel.qolSurveyType = QolSurveyType.Full;
        this.trigger(ScenarioTriggers.Tertiary);
    }

    private async onStartDomains() {
        AppViewModel.Instance.Domain.clearSelectedDomains();
        AppViewModel.Instance.Strategy.clearSelectedDomains();
        this.trigger(ScenarioTriggers.Quinary);
    }

    // used for development only and will be removed
    async onTESTINGButton() {
        await AppViewModel.Instance.QoLHistory.init();
        this.trigger(ScenarioTriggers.TESTING);
    }

    async onSetupButton() { // MK-TODO used for testing only
        for (let i = 0; i < 10; i++) {
            let responses: QolSurveyResults = {
                Thinking: Array.from({ length: 4 }, (x, i) => Math.floor(Math.random() * 4) + 1),
                Home: Array.from({ length: 4 }, (x, i) => Math.floor(Math.random() * 2) + 1),
                Identity: Array.from({ length: 4 }, (x, i) => Math.floor(Math.random() * 5) + 1),
                Independence: Array.from({ length: 4 }, (x, i) => Math.floor(Math.random() * 5) + 1),
                Leisure: Array.from({ length: 4 }, (x, i) => Math.floor(Math.random() * 4) + 1),
                Money: Array.from({ length: 4 }, (x, i) => Math.floor(Math.random() * 5) + 1),
                Mood: Array.from({ length: 4 }, (x, i) => Math.floor(Math.random() * 5) + 1),
                Physical: Array.from({ length: 4 }, (x, i) => Math.floor(Math.random() * 3) + 1),
                Relationships: Array.from({ length: 4 }, (x, i) => Math.floor(Math.random() * 5) + 1),
                Selfesteem: Array.from({ length: 4 }, (x, i) => Math.floor(Math.random() * 5) + 1),
                Sleep: Array.from({ length: 4 }, (x, i) => Math.floor(Math.random() * 1) + 1),
                Spiritual: Array.from({ length: 4 }, (x, i) => Math.floor(Math.random() * 5) + 1),
            };
            let aggregateScore = 0;
            const entries = Object.entries(responses)
            for (const [key, value] of entries) {
                aggregateScore += sum(value);
            }
            aggregateScore /= entries.length

            let completionDates: number[] = [];
            Array.from({ length: 48 }, (x, i) => i).forEach((index) => {
                let date = new Date().getTime() - 10;
                completionDates.push(date);
            })

            await AppController.Instance.User.qol.sendSurveyResults(responses, aggregateScore, i % 4 == 0 ? QolSurveyType.Full : QolSurveyType.Short, new Date().getTime() - 5000, completionDates);
        }
    }

    private openStoryDetails = (jid: string) => {
        this.trigger<CheckInDetailsParams>(ScenarioTriggers.Primary, { id: jid });
    }

    private modalTextsByStatus = (status: InterventionTipsStatuses.StatusIds) => {
        const willDoStatus = status === InterventionTipsStatuses.StatusIds.WillDo;

        const modalTitle = !willDoStatus ? 'Can you try this?' : 'Did you do this?';
        const primaryButtonText = !willDoStatus ? 'Yes, I will' : 'Yes, I did';
        let secondaryButtonText = willDoStatus ? 'No, I didn’t' : 'No, thanks';
        if (this.viewModel.interventionTips.tips.length > 1) {
            secondaryButtonText = 'No, next tip';
        }

        return {
            modalTitle,
            primaryButtonText,
            secondaryButtonText,
        };
    }

    private _onInterventionPrimary = async (tip: Partial<IInterventionTipItem>) => {
        this.hideModal();

        await this.runLongOperation(async () => {
            if (!tip.status || tip.status === InterventionTipsStatuses.StatusIds.NoResponse) {
                await tip.actions.willDo();
            } else {
                await tip.actions.done();
            }
        });
    }

    private _onInterventionSecondary = async (tip: Partial<IInterventionTipItem>) => {
        await this.runLongOperation(async () => {
            if (!tip.status || tip.status === InterventionTipsStatuses.StatusIds.NoResponse) {
                await tip.actions.wontDo();
            } else {
                await tip.actions.didntDo();
            }
        });

        const nextTip = this.viewModel.interventionTips.tips?.[0];
        if (nextTip) {
            this.onInterventionTip(nextTip);
        }
    }

    private onInterventionTip = (t: IInterventionTipItem) => {
        const { modalTitle, primaryButtonText, secondaryButtonText } = this.modalTextsByStatus(t.status);

        this.showModal({
            title: modalTitle,
            message: t.title,
            primaryButton: {
                text: primaryButtonText,
                action: () => this._onInterventionPrimary(t),
            },
            secondaryButton: {
                text: secondaryButtonText,
                action: () => this._onInterventionSecondary(t),
            },
            onClose: () => {
                this.hideModal();
                t.actions.seen();
            },
        });
    }

    private onTipItemPress = (t: ITipItem) => {
        switch (t.type) {
            case 'staticTip': {
                Links.tryOpenLink(t.url);
                return;
            }

            case 'interventionTip': {
                this.onInterventionTip(t);
                return;
            }

            case 'assessment': {
                this.onInTake();
                return;
            }

            case 'check-in': {
                this.onAddCheckin();
                return;
            }

            case 'finish-qol': {
                this.onFinishQol();
                return;
            }

            case 'full-qol': {
                this.onFullQol();
                return;
            }

            case 'docLinkTip': {
                t.open();
                return;
            }

            default: {
                return;
            }
        }
    }

    private getTitle() {
        const {
            today,
            tips,
        } = this.viewModel;

        return (
            <>
                {tips?.length ? (
                    <ScrollView
                        showsHorizontalScrollIndicator={false}
                        horizontal
                        style={{ maxHeight: Layout.isSmallDevice ? 112 : 132 }}
                        contentContainerStyle={styles.tipsList}
                    >
                        {tips.map(s => (
                            <TipItemCard
                                key={s.id}
                                item={s}
                                onPress={() => this.onTipItemPress(s)}
                            />
                        ))}
                    </ScrollView>
                ) : null}
                <Container style={styles.heading}>
                    <Text style={[TextStyles.labelMedium, styles.headingTitle]}>Your Check-ins</Text>
                    <Text style={[TextStyles.labelMedium, styles.date]}>{today}</Text>
                </Container>
            </>
        );
    }

    private getCheckinsList() {
        const { checkIns } = this.viewModel;

        return (
            checkIns.length === 0 ? (
                <Placeholder message={'You don’t have any check-ins yet'} />
            ) : (
                <ScrollView
                    style={{ maxHeight: MaxHeight }}
                    showsHorizontalScrollIndicator={false}
                    horizontal
                    contentContainerStyle={styles.list}
                >
                    {checkIns.map((s, i) => (
                        <CheckInCard
                            key={s.id}
                            model={s}
                            active={i === 0}
                            onPress={() => this.openStoryDetails(s.id)}
                        />
                    ))}
                </ScrollView>
            )
        );
    }

    private onTapOrb(event: GestureResponderEvent) {
        if (Platform.OS == 'ios') {
            ReactNativeHapticFeedback.trigger('impactLight');
        }
        const scaledOrbRadius = this.ordRadius / personaScale;
        let orbLowerX = (Layout.window.width / 2) - scaledOrbRadius
        let orbUpperX = orbLowerX + (2 * scaledOrbRadius);

        let orbUpperY = this.orbTapContainerHeight;
        let orbLowerY = orbUpperY - (scaledOrbRadius * 2);

        if (event.nativeEvent.locationX >= orbLowerX && event.nativeEvent.locationX <= orbUpperX) {
            if (event.nativeEvent.locationY >= orbLowerY && event.nativeEvent.locationY <= orbUpperY) {
                this.trigger(ScenarioTriggers.Next)
            }
        }
    }

    renderContent() {
        const {
            loading,
        } = this.viewModel;

        return (
            <MasloPage style={[this.baseStyles.page, { backgroundColor: Colors.home.bg }]}>
                <Animated.View style={[this.baseStyles.container, styles.container, { height: this._contentHeight, opacity: this.state.opacity }]}>
                    {/* Portal component used to capture touch events on/above orb */}
                    <Portal>
                        {Platform.OS == 'ios' ?
                            <Pressable onPress={this.onTapOrb} style={{ width: Layout.window.width, height: this.orbTapContainerHeight, zIndex: 9999 }}>
                                <View style={{ width: '100%', height: this.orbTapContainerHeight }} />
                            </Pressable>
                            :
                            <TouchableNativeFeedback onPress={this.onTapOrb} style={{ width: Layout.window.width, height: this.orbTapContainerHeight, zIndex: 9999 }}>
                                <View style={{ width: '100%', height: this.orbTapContainerHeight }} />
                            </TouchableNativeFeedback>
                        }
                    </Portal>
                    <View style={{ flexDirection: 'row' }}>
                        <Button title='Domains' style={styles.qolButton} onPress={() => this.onStartDomains()} />
                        {/* MK-TODO below buttons used for development/testing only and will be removed */}
                        <Button title='WorkingView' style={styles.qolButton} onPress={() => this.onTESTINGButton()} />
                        <Button title='SETUP History' style={styles.qolButton} onPress={() => this.onSetupButton()} />
                    </View>
                    {this.state.isUnfinishedQol === null ? <Text>Loading..</Text> : this.getTitle()}
                    {loading
                        ? <ActivityIndicator size='large' />
                        : this.getCheckinsList()
                    }
                    <BottomBar screen={'home'} />
                </Animated.View>
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        alignContent: 'flex-end',
        paddingBottom: 110,
    },
    heading: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 32,
        marginBottom: 16,
    },
    headingTitle: {
        color: Colors.home.headingTitle,
    },
    date: {
        textTransform: 'uppercase',
    },
    title: {
        marginTop: 47,
        marginBottom: 12,
    },
    list: {
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        paddingHorizontal: 20,
    },
    tipsList: {
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        paddingHorizontal: 20,
    },
    newLinkMsgBlock: {
        width: '100%',
        marginTop: 12,
    },
    newLinkMsg: {
        paddingHorizontal: 5,
        textAlign: 'center',
    },
    qolButton: {
        width: '30%',
        height: 30,
        marginLeft: 20,
        marginBottom: 15
    },
});
