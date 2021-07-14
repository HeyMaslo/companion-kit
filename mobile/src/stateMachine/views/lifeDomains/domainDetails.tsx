import { observer } from 'mobx-react';
import React from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { Container, MasloPage, StrategyCard, Button } from 'src/components';
import { DomainName } from 'src/constants/Domain';
import { StrategyIded } from 'src/constants/Strategy';
import TextStyles from 'src/styles/TextStyles';
import AppViewModel from 'src/viewModels';
import { ScenarioTriggers } from '../../abstractions';
import { ViewState } from '../base';

@observer
export class DomainDetailsView extends ViewState {

    private numberOfRemainingStrategies = -1;

    constructor(props) {
        super(props);
        this.onLearnMorePress = this.onLearnMorePress.bind(this);
        this._contentHeight = this.persona.setupContainerHeightForceScroll({ rotation: -15, transition: { duration: 1 }, scale: 0.8 });
    }

    async start() {}

    private get viewModel() {
        return AppViewModel.Instance.ChooseDomain;
    }

    private get strategiesViewModel() {
        return AppViewModel.Instance.ChooseStrategy;
    }

    private cancel = () => {
        this.trigger(ScenarioTriggers.Cancel);
    }

    private loadMoreStrategies = () => {
        this.trigger(ScenarioTriggers.Next);
    }

    private strategiesForListInOrder(domain: DomainName): StrategyIded[] {
        const numberOfStrategiesToShow = 5;
        const selected = this.strategiesViewModel.selectedStrategies.filter((s) => s.associatedDomainNames.includes(domain));
        const remianing = this.strategiesViewModel.availableStrategies.filter((s) => s.associatedDomainNames.includes(domain) && !selected.includes(s)) as StrategyIded[];

        const amountToAppend = Math.max(0, numberOfStrategiesToShow - selected.length);
        this.numberOfRemainingStrategies = remianing.length - amountToAppend;

        return selected.concat(remianing).slice(0, numberOfStrategiesToShow);
    }

    onLearnMorePress(id: string) {
        this.strategiesViewModel.learnMoreStrategy = this.strategiesViewModel.getStrategyById(id);
        this.trigger(ScenarioTriggers.Tertiary);
    }

    renderListItem = ({ item }) => (
        <StrategyCard item={item} onSelectStrategy={(()=>(null))} onLearnMorePress={this.onLearnMorePress} hideCheckbox={true}/>
      );

    renderContent() {
        const [leftName, mainName, rightName, mainImportance] = this.viewModel.getDomainDisplay();

        return (
            <MasloPage style={[this.baseStyles.page,{backgroundColor: '#E7E7F6'}]} onClose={this.cancel}>
                <Container style={[styles.container, {height: this._contentHeight}]}>
                    <Text style={[this.textStyles.h1, styles.header]}>Let’s talk about {mainName}:</Text>

                    <View style={styles.content}>
                        <Text style={[this.textStyles.labelExtraLarge, {marginBottom: 10}]}>What to know:</Text>
                        <Text>bullet points here and here</Text>
                    </View>
                    <ScrollView>
                        <Text>{mainImportance}</Text>
                        </ScrollView>
                    <Text style={[this.textStyles.h1, styles.header]}>Strategies:</Text>
                    <FlatList style={styles.list}    
                        data={this.strategiesForListInOrder(mainName as DomainName)}
                        renderItem={this.renderListItem}
                        keyExtractor={item => item.id}/>
                    {this.numberOfRemainingStrategies > 0 && <Button title='Load more strategies' style={styles.button} titleStyles={{ color: TextStyles.h1.color }} withBorder={false} onPress={this.loadMoreStrategies}/>}
                </Container>
             </MasloPage>
        );
    }
}

const styles = StyleSheet.create({ 
    header: {
        alignSelf: 'flex-start',
        marginBottom: 20,
    },
    container: {
        paddingTop: 40,
        paddingBottom: 15,
        backgroundColor:'#E7E7F6',
        alignItems:'center',
    },
    content: {
        width: '90%',
        backgroundColor: '#ffff',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
    list: {
        marginBottom: 25,
    },
    listItem: {
        borderWidth: 1,
        borderRadius: 7,
        borderColor: '#CBC8CD',
        padding: 10,
        marginBottom: 30,
    },
    button: {
        height: 30,
        width: '60%',
        backgroundColor: 'transparent',
        marginBottom: 30,
    },
});
