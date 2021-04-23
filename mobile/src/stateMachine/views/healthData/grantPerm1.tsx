import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';
import { MasloPage, Container, Button,ButtonBlock, } from 'src/components';

import { ScenarioTriggers } from '../../abstractions';
import Images from 'src/constants/images';
import Dots from 'src/components/Dots';

import Layout from 'src/constants/Layout';
import { PersonaScrollMask } from 'src/components/PersonaScollMask';

@observer
export class GrantPermissionGfitView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScroll();
    }

    async start() {
        // this.model.notifications.init();
    }

    back = () => {
        // this.viewModel.resetFeelings();
        this.trigger(ScenarioTriggers.Primary);
    }

    onClose = () => {
        this.trigger(ScenarioTriggers.Primary);
    }

    onNext = () => {
        this.trigger(ScenarioTriggers.Secondary);

    }
   

    renderContent() {
        const screen1 = Images.screen1;

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
                            <Text style={[this.textStyles.h1, this.baseStyles.textCenter]}>Open Settings App on your device and click Health</Text>
                        </View>
                        <View style={{justifyContent: 'center', alignContent:'center', alignItems:'center', marginBottom: 40}}>
                        <Image source={screen1} style={{width:300, height:400}}/>
                        </View>
                        <ButtonBlock
                            onOk={this.onNext}
                            onCancel={this.back}
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
    gIcon: {
        width: 19,
        height: 19,
        marginRight: 14,
    },
});
