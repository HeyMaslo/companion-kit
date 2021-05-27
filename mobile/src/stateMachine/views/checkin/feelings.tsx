import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Container, MasloPage, ButtonBlock, Button, SelectItem } from 'src/components';
import { observer } from 'mobx-react';
import { PersonaStates, ScenarioTriggers } from '../../abstractions';
import { CheckInViewBase } from './checkInViewBase';
import Layout from 'src/constants/Layout';
import Images from 'src/constants/images';
import Dots from 'src/components/Dots';
import { MultiselectViewModel } from 'common/viewModels/MultiselectViewModel';
import * as Haptics from 'src/services/haptics';
import { PersonaScrollMask } from 'src/components/PersonaScollMask';

const FeelingsSelect = observer((props: { model: MultiselectViewModel }) => {
    const m = props.model;
    return (
        <>
            {m.items.map((item, i) =>  (
                <SelectItem
                key={`${item.value}_${i}`}
                title={item.label}
                isActive={m.selectedValues.indexOf(item.value.toString()) > -1}
                onPress={() => {
                    Haptics.selection();
                    const index = m.selectedValues.indexOf(item.value.toString());

                    if (index === -1) {
                        m.selectedItems.push(item);
                    } else {
                        m.selectedItems.splice(index, 1);
                    }

                }}
                />
            ))}
        </>
    );
});

@observer
export class FeelingsView extends CheckInViewBase {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScroll();
    }

    start() {
        super.start();
        this.persona.state = PersonaStates.Upset;
    }

    back = () => {
        this.viewModel.resetFeelings();
        this.trigger(ScenarioTriggers.Back);
    }

    next = () => {
        this.trigger(ScenarioTriggers.Primary);
    }

    renderContent() {
        const { viewModel } = this;
        const { feelingsMultiSelect, isFeelingsSelected } = viewModel;
        if (!feelingsMultiSelect) {
            return null;
        }

        return (
            <MasloPage style={this.baseStyles.page}>
                <Container style={styles.topBarWrapWrap}>
                    <PersonaScrollMask height={Layout.getViewHeight(24)} />
                    <View style={styles.topBarWrap}>
                        <Dots length={3} active={0} styles={{ left: 0 }} />
                        <Button style={styles.closeBtn} underlayColor="transparent" onPress={this.onClose}>
                            <Images.closeIcon width={28} height={14} />
                        </Button>
                    </View>
                </Container>
                <ScrollView style={[{ zIndex: 0, elevation: 0 }]}>
                    <Container style={[this.baseStyles.container, styles.container]}>
                        <View style={[this.baseStyles.textBlock, styles.textBlock]}>
                            <Text style={[this.textStyles.h1, this.baseStyles.textCenter]}>I'm sorry to hear that</Text>
                            <Text style={[this.textStyles.p1, this.baseStyles.textCenter]}>Can you tell me more about how you feel?</Text>
                        </View>
                        <View style={[styles.feelingsWrap]}>
                            <FeelingsSelect model={feelingsMultiSelect} />
                        </View>
                        <ButtonBlock
                            onOk={this.next}
                            onCancel={this.back}
                            nextDisabled={!isFeelingsSelected}
                        />
                    </Container>
                </ScrollView> 
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        minHeight: Layout.window.height,
        paddingTop: Layout.getViewHeight(21),
    },
    feelingsWrap: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        width: '100%',
        marginBottom: 56,
    },
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
        height: 50,
        zIndex: 2,
        elevation: 2,
    },
    closeBtn: {
        width: 50,
        height: 50,
        alignItems: 'flex-end',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    textBlock: {
        marginBottom: 64,
    },
});
