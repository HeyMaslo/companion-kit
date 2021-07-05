import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TextStyles from 'src/styles/TextStyles';
import { Container, ActivityButton, MasloPage } from 'src/components';
import { ViewState } from './base';
import BaseStyles from 'src/styles/BaseStyles';
import Colors from 'src/constants/colors';
import Layout from 'src/constants/Layout';
import ConcentricCircles, {
    ConcentricCirclesStyles,
} from 'src/components/ConcentricCircles';
import { ScenarioTriggers } from 'src/stateMachine/abstractions';
import { RewardsViewViewModel } from 'src/viewModels/RewardsViewViewModel';

const concentricCirclesStyles: ConcentricCirclesStyles = {
    diameter: 200,
    strokeBgColor: '#39309C',
};

export class RewardsView extends ViewState {
    readonly model = new RewardsViewViewModel();

    start() {
        this.persona.setupContainerHeightForceScroll({
            transparency: 1,
            position: { x: 0, y: 1 },
        });
    }

    private onClose = () => {
        this.trigger(ScenarioTriggers.Cancel);
    };

    private onShare = async () => {
        await this.model.shareReward();
        this.trigger(ScenarioTriggers.Submit);
    };

    renderContent() {
        const { currentCheckInsCount: count } = this.model.rewards;

        return (
            <MasloPage style={BaseStyles.page} onClose={this.onClose}>
                <Container
                    style={[
                        BaseStyles.container,
                        BaseStyles.flexBetween,
                        { height: Layout.getViewHeight(91.7) },
                    ]}>
                    <ConcentricCircles
                        styles={concentricCirclesStyles}
                        model={this.model.rewards}
                    />
                    <View style={styles.numberOfCheckins}>
                        <Text style={TextStyles.p1}>{count}</Text>
                    </View>
                    <View style={[BaseStyles.textBlock, styles.textBlock]}>
                        <Text style={[TextStyles.h1, styles.title]}>
                            New Milestone
                        </Text>
                        <Text
                            style={[
                                Layout.isSmallDevice
                                    ? TextStyles.p2
                                    : TextStyles.p1,
                                styles.desc,
                            ]}>
                            Awesome{' '}
                            <Text style={{ textTransform: 'capitalize' }}>
                                {this.model.clientName}
                            </Text>
                            ! You completed {count} check-in
                            {count > 1 ? 's' : ''}. Keep going!
                        </Text>
                    </View>
                    <ActivityButton
                        onPress={this.onShare}
                        title={'Share with my Therapist'}
                        loading="promise"
                        style={styles.btn}
                    />
                </Container>
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({
    numberOfCheckins: {
        position: 'relative',
        top: -20,
        height: 32,
        backgroundColor: '#4C40CF',
        paddingHorizontal: 19,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        elevation: 1,
    },
    textBlock: {
        marginTop: 44,
    },
    title: {
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%',
    },
    desc: {
        textAlign: 'center',
        marginTop: 16,
        width: '100%',
        color: Colors.secondarySubtitle,
    },
    btn: {
        marginTop: 'auto',
    },
});
