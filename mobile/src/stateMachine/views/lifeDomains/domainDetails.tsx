import { observer } from 'mobx-react';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Container, MasloPage, StrategyCard, Button } from 'src/components';
import { containerStyles } from 'src/components/Container';
import { DomainName } from 'src/constants/Domain';
import Layout from 'src/constants/Layout';
import { DisplayStrategy } from 'src/constants/Strategy';
import { formatTextContent, iconForDomain } from 'src/helpers/DomainHelper';
import AppViewModel from 'src/viewModels';
import { ScenarioTriggers } from '../../abstractions';
import { ViewState } from '../base';

@observer
export class DomainDetailsView extends ViewState {

    private numberOfRemainingStrategies = -1;

    constructor(props) {
        super(props);
        this._contentHeight = Layout.window.height;
        this.hidePersona2();
        this.onLearnMorePress = this.onLearnMorePress.bind(this);
    }

    async start() { }

    private get viewModel() {
        return AppViewModel.Instance.Domain;
    }

    private get strategiesViewModel() {
        return AppViewModel.Instance.Strategy;
    }

    private cancel = () => {
        this.trigger(ScenarioTriggers.Cancel);
    }

    private loadMoreStrategies = () => {
        this.trigger(ScenarioTriggers.Next);
    }

    // selected strategies will be at the front of the list
    private strategiesForListInOrder(domain: string, lengthOfListToShow = 5): DisplayStrategy[] {
        const selected: DisplayStrategy[] = this.strategiesViewModel.selectedStrategies.filter((s) => s.associatedDomainNames.includes(domain)).map((strat) => {
            return { ...strat, isChecked: true };
        });
        const selectedIds = selected.map((x) => x.internalId);
        const remianing: DisplayStrategy[] = this.strategiesViewModel.allStrategies.filter((s) => s.associatedDomainNames.includes(domain) && !selectedIds.includes(s.internalId));

        const difference = Math.max(0, lengthOfListToShow - selected.length);
        this.numberOfRemainingStrategies = remianing.length - difference;

        return selected.concat(remianing).slice(0, lengthOfListToShow);
    }

    onLearnMorePress(id: string) {
        this.strategiesViewModel.learnMoreStrategy = this.strategiesViewModel.getStrategyById(id);
        this.trigger(ScenarioTriggers.Tertiary);
    }

    renderStratgeyCard = (strategy: DisplayStrategy) => (
        <StrategyCard key={strategy.internalId} item={strategy} onLearnMorePress={this.onLearnMorePress} hideCheckbox={!strategy.isChecked} theme={this.theme} />
    );

    renderBulletPoint(str: string) {
        return (
            <View key={str} style={{ flexDirection: 'row', marginVertical: 10 }}>
                <Text style={this.textStyles.p2}>{'\u2022'}</Text>
                <Text style={[this.textStyles.p2, { flex: 1, paddingLeft: 5 }]}>{str}</Text>
            </View>
        );
    }

    renderContent() {
        const display = this.viewModel.getDomainDisplay();
        const subdomains = display.subdomains;
        const learnMoreSubdomain = this.viewModel.learnMoreSubdomain;

        let mainName = display.mainName;
        let importance = display.mainImportance;
        let whatToKnowBullets = this.viewModel.getDomainByName(mainName as DomainName).whatToKnowBullets

        if (subdomains && subdomains.includes(learnMoreSubdomain)) {
            mainName = learnMoreSubdomain.name
            importance = learnMoreSubdomain.importance
            whatToKnowBullets = learnMoreSubdomain.bullets
        }
        const domainString = mainName == DomainName.PHYSICAL ? 'Physical health' : mainName;

        return (
            <MasloPage style={[this.baseStyles.page, { backgroundColor: this.theme.colors.highlightSecondary }]} onClose={this.cancel} theme={this.theme}>
                <Container style={[styles.container, { height: this._contentHeight }]}>
                    {/* Title */}
                    <Text style={[this.textStyles.h1, styles.header]}>{domainString} and your quality of life</Text>
                    <ScrollView style={{ width: Layout.window.width }} contentContainerStyle={{ alignItems: 'center' }}>
                        {/* What to know */}
                        <View style={styles.content}>
                            <Text style={[this.textStyles.labelExtraLarge, { marginVertical: 10 }]}>What to know</Text>
                            <View style={{ marginBottom: 0 }}>
                                {whatToKnowBullets.map((b) => this.renderBulletPoint(b))}
                            </View>
                            {/* List of subdomains (if applicable) */}
                            {subdomains && subdomains.map((subDom) => {
                                return (
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginTop: 30, marginBottom: 10 }}>
                                        {iconForDomain(subDom.name, { marginHorizontal: 15 }, this.theme.colors.foreground)}
                                        <Text style={this.textStyles.p2}>{subDom.name}</Text>
                                    </View>
                                );
                            })}
                        </View>
                        {/* Long description of importance */}
                        <Text style={[this.textStyles.p2, { marginBottom: 20, paddingHorizontal: containerStyles.container.paddingLeft }]}>
                            <Text style={this.textStyles.h3}>The Importance of {domainString}{'\n'}</Text>
                            {'\n'}
                            {formatTextContent(importance)}
                        </Text>
                        {/* Strategies List */}
                        <Text style={[this.textStyles.h2, styles.header, { paddingLeft: containerStyles.container.paddingLeft }]}>Strategies:</Text>
                        {this.strategiesForListInOrder(mainName).map((strat) => this.renderStratgeyCard(strat))}
                        {this.numberOfRemainingStrategies > 0 && <Button title='Load more strategies' style={styles.button} withBorder={false} onPress={this.loadMoreStrategies} theme={this.theme} />}
                    </ScrollView>
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
        backgroundColor: '#E7E7F6',
        alignItems: 'center',
    },
    content: {
        width: '90%',
        backgroundColor: '#ffff',
        padding: 10,
        borderRadius: 5,
        marginBottom: 30,
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
