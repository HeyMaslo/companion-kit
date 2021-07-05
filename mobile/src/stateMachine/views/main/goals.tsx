import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { MasloPage, Container } from 'src/components';
import Images from 'src/constants/images';

import { ViewState } from '../base';
import Layout from 'src/constants/Layout';
import { PersonaScrollMask } from 'src/components/PersonaScollMask';
import { notch } from 'src/styles/BaseStyles';
import BottomBar from 'src/screens/components/BottomBar';
import GoalCard from 'src/components/GoalCard';
import AppViewModel from 'src/viewModels';
import Colors from 'src/constants/colors';

@observer
export class GoalsView extends ViewState {
    get model() {
        return AppViewModel.Instance.Goals;
    }

    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScroll();
    }

    async start() {
        this.model.visit();
    }

    getPlaceholder() {
        return (
            <View style={styles.placeholder}>
                <Images.noStatistics width={258} height={145} />
                <Text style={[this.textStyles.h1, styles.placeholderHeading]}>
                    No goals yet
                </Text>
                <Text style={[this.textStyles.p1, styles.placeholderSubtitle]}>
                    You and your therapist have not created any goals for you
                    yet.
                </Text>
            </View>
        );
    }

    renderContent() {
        const activeCount = this.model.activeGoals.length;
        const completedCount = this.model.achievedGoals.length;
        const totalCount = activeCount + completedCount;

        return (
            <MasloPage style={[this.baseStyles.page, styles.page]}>
                <Container style={styles.topBar}>
                    <PersonaScrollMask
                        height={
                            notch
                                ? Layout.getViewHeight(22)
                                : Layout.getViewHeight(25)
                        }
                    />
                </Container>
                {totalCount > 0 ? (
                    <ScrollView style={styles.scrollView}>
                        <Container
                            style={[
                                this.baseStyles.container,
                                styles.container,
                            ]}>
                            <Text
                                style={[
                                    this.textStyles.labelMedium,
                                    styles.overline,
                                ]}>
                                <Text style={{ color: '#F0F1FF' }}>
                                    My goals
                                </Text>{' '}
                                {activeCount}
                            </Text>
                            {this.model.activeGoals.map((g, i) => (
                                <GoalCard
                                    key={i}
                                    title={g.title}
                                    checked={false}
                                    onPress={g.toggleComplete}
                                />
                            ))}
                            {this.model.achievedGoals.length > 0 && (
                                <>
                                    <Text
                                        style={[
                                            this.textStyles.labelMedium,
                                            styles.overline,
                                        ]}>
                                        <Text style={{ color: '#F0F1FF' }}>
                                            Done
                                        </Text>{' '}
                                        {completedCount}
                                    </Text>
                                    {this.model.achievedGoals.map((g, i) => (
                                        <GoalCard
                                            key={i}
                                            title={g.title}
                                            checked={true}
                                            onPress={g.toggleComplete}
                                        />
                                    ))}
                                </>
                            )}
                        </Container>
                    </ScrollView>
                ) : (
                    this.getPlaceholder()
                )}
                <BottomBar screen={'goals'} />
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({
    page: {
        paddingBottom: 90,
    },
    topBar: {
        position: 'absolute',
        top: 0,
        width: '100%',
        zIndex: 2,
        elevation: 2,
    },
    scrollView: {
        zIndex: 0,
        elevation: 0,
    },
    container: {
        minHeight: Layout.window.height,
        paddingTop: Layout.getViewHeight(20),
    },
    placeholder: {
        width: '100%',
        paddingHorizontal: 24,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
    },
    placeholderHeading: {
        marginTop: 24,
        marginBottom: 16,
    },
    placeholderSubtitle: {
        textAlign: 'center',
        color: Colors.secondarySubtitle,
    },
    overline: {
        marginTop: 8,
        marginBottom: 16,
    },
});
