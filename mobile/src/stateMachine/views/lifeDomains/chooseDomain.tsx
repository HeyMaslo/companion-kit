import { observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, Animated } from 'react-native';
import { Button, ButtonBlock, Container, MasloPage } from 'src/components'
import { Domain, DomainName, SubdomainName } from 'src/constants/Domain';
import Images from 'src/constants/images';
import Layout from 'src/constants/Layout';
import { iconForDomain } from 'src/helpers/DomainHelper';
import TextStyles, { mainFontMedium } from 'src/styles/TextStyles';
import AppViewModel from 'src/viewModels';
import { ScenarioTriggers } from '../../abstractions';
import { centerDomainFontSize, ViewDomainsBase } from './viewDomainsBase';

const fadeEnd = new Animated.Value(1.0);

@observer
export class ChooseDomainView extends ViewDomainsBase {

    private checkedSubdomains: SubdomainName[] = [];
    @observable
    private refresh = false

    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScrollDown({ rotation: -15, transition: { duration: 1 }, scale: 1.2 });
    }

    private get viewModel() {
        return AppViewModel.Instance.Domain;
    }

    async start() {
        this.viewModel.fetchPossibleDomains();
        this.forceUpdate();
    }

    getDomainDisplay = (): string[] => {
        return this.viewModel.getDomainDisplay();
    }

    getDomainImportanceBullets = (): string[] => {
        const [lDomain, domain, rDomain, importance] = this.getDomainDisplay();
        if (domain) {
            return this.viewModel.getDomainByName(domain as DomainName).bullets;
        }
        return [];
    }

    goToRight = () => {
        this.viewModel.moveToNextDomain(1);
    }

    goToLeft = () => {
        this.viewModel.moveToNextDomain(-1);
    }

    onBack = null;

    onCancel = () => {
        this.clearDomains();
        this.trigger(ScenarioTriggers.Cancel);
    }

    onDetails = () => {
        this.trigger(ScenarioTriggers.Submit);
    }

    public getCenterElement(): JSX.Element {
        const [lDomain, domain, rDomain, importance] = this.getDomainDisplay();
        const domainName = domain as DomainName;
        return (
            <Button
                title={this.viewModel.selectedDomains.domains.includes(domainName) && this.viewModel.selectedDomains.domains.length > 0 ? 'Choose Strategies' : 'Select Life Area'}
                style={styles.domain}
                onPress={() => this.onSelectPressed(domainName)}
                isTransparent
            />
        );
    }
    // Subdomain selection pop up
    public getPopUpElement(): JSX.Element {
        this.state.popUpFadeOpacity != fadeEnd && Animated.timing(this.state.popUpFadeOpacity, {
            toValue: 1,
            delay: 50,
            duration: 350,
            useNativeDriver: true
        }).start();
        const mainDomain = this.viewModel.mainDomain;
        return (
            <Animated.View style={{ opacity: this.state.popUpFadeOpacity }}>
                <MasloPage style={[this.baseStyles.page, { paddingBottom: 30 }]}>
                    <Container style={[{ height: this._contentHeight, alignItems: 'center' }]}>
                        <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', height: Layout.window.height * 0.25, marginBottom: 10 }}>
                            {iconForDomain(mainDomain.name, { flex: 1 }, 'purple', 60, 60, 'purple')}
                            <Text style={[TextStyles.p1, styles.subdomainTitle, { fontSize: centerDomainFontSize, lineHeight: centerDomainFontSize }]}>{mainDomain.name}</Text>
                        </View>

                        <FlatList style={styles.subdomainList}
                            data={mainDomain.subdomains}
                            extraData={this.refresh}
                            renderItem={this.renderListItem}
                            keyExtractor={item => item.name} />

                        <Text style={styles.descriptionText}>Select any specific aspects of the {mainDomain.name} life area you’d like to focus on.</Text>
                        <ButtonBlock okTitle={'DONE'} cancelTitle={'BACK'} onCancel={this.closePopUp} onOk={() => this.onDoneChoosingSubdomains(mainDomain)} nextDisabled={this.checkedSubdomains.length == 0} />
                    </Container>
                </MasloPage>
            </Animated.View>
        );
    }

    renderListItem = ({ item }) => (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 }}>
            <TouchableOpacity onPress={() => this.toggleSubdomainCheck(item.name)}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <View style={[styles.checkbox, this.checkedSubdomains.includes(item.name) && styles.checkboxChecked, { display: 'flex' }]}>
                        {this.checkedSubdomains.includes(item.name) && <Images.radioChecked width={8} height={6} fill={'purple'} />}
                    </View>
                    {iconForDomain(item.name, { marginHorizontal: 15 })}
                    <Text>{item.name}</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.onSubdomainLearnMorePress(item.name)} hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}>
                <Text style={[TextStyles.labelMedium, { textAlign: 'center', color: 'purple', paddingRight: 7 }]}>{'Learn\nMore'}</Text>
            </TouchableOpacity>
        </View>
    );

    private toggleSubdomainCheck(name: SubdomainName) {
        const index = this.checkedSubdomains.indexOf(name, 0);
        if (index > -1) {
            this.checkedSubdomains.splice(index, 1);
        } else {
            this.checkedSubdomains.push(name);
        }
        this.refresh = !this.refresh;
    }

    private onSubdomainLearnMorePress(name: SubdomainName) {
        console.log('learn more about ', name)
        // MK-TODO - implement this
    }

    private onDoneChoosingSubdomains(mainDomain: Domain) {
        this.closePopUp();
        this.selectDomain(mainDomain);
    }

    closePopUp = () => {
        this.showSubdomainPopUp = false;
        this.state.popUpFadeOpacity = new Animated.Value(0.0);
    }
    // End subdomain selection pop up

    private onSelectPressed(name: DomainName) {
        const domain = this.viewModel.getDomainByName(name);
        if (domain.name == DomainName.PHYSICAL) { // If more categories of subdomains (besides Physical) are added this will need to be changed
            this.showSubdomainPopUp = true;
        } else {
            this.selectDomain(domain);
        }
    }

    selectDomain = (domain: Domain) => {
        // MK-TODO: - This entire function will need to be reworked after the new select/deselct domain button design is finalized
        //            It's a mess right now
        let hasTwoSelected = this.viewModel.selectedDomains.domains.length == 2;
        let hasThreeSelected = this.viewModel.selectedDomains.domains.length == 3;

        if (hasThreeSelected && this.viewModel.selectedDomains.domains.includes(domain.name)) {
            this.trigger(ScenarioTriggers.Next);
        } else if (hasThreeSelected) {
            Alert.alert('Too Many', 'Looks like you have already selected three life areas.', [{ text: 'Deselect all', onPress: () => this.clearDomains(), style: 'destructive' }, { text: 'OK' }]);
        } else if (this.viewModel.selectDomain(domain)) {
            this.viewModel.selectSubdomains(this.checkedSubdomains);
            if (hasTwoSelected) {
                this.trigger(ScenarioTriggers.Next); // goes to end of choosing view, right before strategies
            } else {
                this.trigger(ScenarioTriggers.Tertiary); // goes to selection confirmation
            }
        } else if (!this.viewModel.selectDomain(domain)) {
            this.trigger(ScenarioTriggers.Tertiary);
        } else {
            Alert.alert(
                'Oops',
                'There was an error selecting that life area.',
                [{ text: 'OK' }]);
        }
    }

    private clearDomains = () => {
        this.viewModel.clearSelectedDomains();
        AppViewModel.Instance.Strategy.setSelectedDomains({ domains: [], subdomains: [] });
    }
}

const checkboxSize = 24;
const styles = StyleSheet.create({
    domain: {
        height: 50,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: 'rgb(120,120,120)',
        width: '90%',
    },
    subdomainTitle: {
        fontWeight: '500',
        letterSpacing: 1.79,
        fontFamily: mainFontMedium,
        textTransform: 'uppercase',
    },
    subdomainList: {
        width: '90%',
    },
    checkbox: {
        height: checkboxSize,
        width: checkboxSize,
        borderRadius: checkboxSize / 2,
        borderWidth: 1,
        borderColor: 'purple',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        flexShrink: 0,
    },
    checkboxChecked: {
        backgroundColor: 'purple',
        borderWidth: 0,
    },
    descriptionText: {
        marginBottom: 50,
        textAlign: 'center',
    }
});
