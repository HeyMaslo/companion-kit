import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, ScrollView, ActivityIndicator, View, Animated } from 'react-native';
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
import { QolType } from 'src/viewModels/QoLViewModel';

const minContentHeight = 535;
const MaxHeight = Layout.isSmallDevice ? 174 : 208;

let isFirstLaunch = true;

@observer
export class HomeView extends ViewState<{ opacity: Animated.Value, isUnfinishedQol: boolean }> {

    private _linkDocModalShown = true;

    state = {
        opacity: new Animated.Value(0),
        isUnfinishedQol: null,
    };

    constructor(props, ctx) {
        super(props, ctx);

        const smallHeight = this.layout.window.height < 800;
        this.persona.state = PersonaStates.Idle;
        this._contentHeight = smallHeight
            ? this.persona.setupContainerHeightForceScroll({ rotation: 120 , transition: {duration: 1.5}})
            : this.persona.setupContainerHeight(minContentHeight, { rotation: 120 , transition: {duration: 1.5}});
    }

    get viewModel() { return HomeViewModel.Instance; }
    get viewQolModel() { return AppViewModel.Instance.QOL; }
    

    async start() {
        await AppViewModel.Instance.QOL.init();
        const mags = await this.viewModel.getArmMagnitudes();
        this.persona.qolMags = mags;
        this.setState({...this.state, isUnfinishedQol: AppViewModel.Instance.QOL.isUnfinished});
        Animated.timing(this.state.opacity, {
            toValue: 1,
            delay: isFirstLaunch ? 1000 : 400,
            duration: 500,
            useNativeDriver: true
        }).start(this.checkNewLinkDoc);
        isFirstLaunch = false;
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

    private onfinishQol = () => {
        this.trigger(ScenarioTriggers.Quaternary);
    }

    private onMonthlyQol = () => {
        this.viewQolModel.setQolType = QolType.Monthly;
        this.trigger(ScenarioTriggers.Tertiary);
    }

    private onStartQOL = () => {
        this.trigger(ScenarioTriggers.Tertiary);
    }
    private onStartDomains = () => {
        this.trigger(ScenarioTriggers.Next);
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
                this.onfinishQol();
                return;
            }

            case 'monthly-qol': {
                this.onMonthlyQol();
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
                        {/* add logic to render certain things in check in spot depending on state of partial save*/}
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

    renderContent() {
        const {
            loading,
        } = this.viewModel;

        return (
            <MasloPage style={[this.baseStyles.page, { backgroundColor: Colors.home.bg }]}>
                <Animated.View style={[this.baseStyles.container, styles.container, { height: this._contentHeight, opacity: this.state.opacity }]}>
                    <View style={{flexDirection:'row'}}>
                    <Button title="Domains" style={styles.qolButton} onPress={() => this.onStartDomains()}/>
                    <Button title="Qol Survey" style={styles.qolButton} onPress={() => this.onStartQOL()}/>
                    </View>
                    {this.state.isUnfinishedQol === null ? <Text>Loading..</Text> : this.getTitle()}
                    { loading
                        ? <ActivityIndicator size="large" />
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
    domainView: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    }
});
