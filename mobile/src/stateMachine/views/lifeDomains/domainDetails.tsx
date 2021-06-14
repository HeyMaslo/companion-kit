import { observer } from 'mobx-react';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Container, MasloPage } from 'src/components';
import AppViewModel from 'src/viewModels';
import { ScenarioTriggers } from '../../abstractions';
import { ViewState } from '../base';


@observer
export class DomainDetailsView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScroll({ rotation: -15, transition: { duration: 1 }, scale: 0.8 });
    }

    async start() {}

    public get viewModel() {
        return AppViewModel.Instance.ChooseDomain;
    }
    

    private cancel = () => {
        this.trigger(ScenarioTriggers.Cancel);
    }

    renderContent() {
        const [leftName, mainName, rightName, mainImportance] = this.viewModel.getDomainDisplay();

        return (
            <MasloPage style={[this.baseStyles.page,{backgroundColor: '#E7E7F6'}]} onClose={() => this.cancel()}>
                <Container style={[styles.container, {height: this._contentHeight}]}>
                    <View style={styles.header}>
                    <Text style={this.textStyles.h1}>Why {mainName} is important to your quality of life</Text>
                    </View>
                    <View style={styles.content}>
                        <Text style={[this.textStyles.h3, {marginBottom: 10}]}>What to know:</Text>
                        <ScrollView>
                        <Text>{mainImportance}</Text>
                        </ScrollView>
                    </View>
                </Container>
             </MasloPage>
        );
    }
}

const styles = StyleSheet.create({ 
    header: {
        justifyContent:'center',
        alignItems:'center',
        marginBottom: 20,
    },
    container: {
        paddingTop: 90,
        paddingBottom: 15,
        backgroundColor:'#E7E7F6',
        alignItems:'center',
    },
    content: {
        width: '90%',
        backgroundColor: '#ffff',
        padding: 10,
        borderRadius: 5,
    },
});
