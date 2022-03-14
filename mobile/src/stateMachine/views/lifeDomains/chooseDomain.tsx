import { observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, Animated } from 'react-native';
import { Button, ButtonBlock, Container, MasloPage } from 'src/components'
import { Domain, DomainName, Subdomain, SubdomainName } from 'src/constants/Domain';
import Images from 'src/constants/images';
import Layout from 'src/constants/Layout';
import { iconForDomain } from 'src/helpers/DomainHelper';
import TextStyles, { mainFontMedium } from 'src/styles/TextStyles';
import AppViewModel from 'src/viewModels';
import { ScenarioTriggers } from '../../abstractions';
import { centerDomainFontSize, ViewDomainsBase } from './viewDomainsBase';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

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
        await this.viewModel.fetchPossibleDomains();
        this.checkedSubdomains = this.viewModel.checkedSubdomains;
        if (this.viewModel.learnMoreSubdomain != null) {
            this.showSubdomainPopUp = true;
            this.state.popUpFadeOpacity = fadeEnd;
            this.viewModel.learnMoreSubdomain = null;
        }
        this.showBottomBanner = this.viewModel.selectedDomains.domains.length !== 0 && !this.showSubdomainPopUp;
        super.forceUpdate();
        await AppViewModel.Instance.Strategy.fetchPossibleStrategies();
    }

    async end() {
        this.checkedSubdomains = [];
    }

    getDomainDisplay = (): { leftName: string, mainName: string, rightName: string, mainImportance: string, subdomains: Subdomain[] } => {
        return this.viewModel.getDomainDisplay();
    }

    getDomainImportanceBullets = (): string[] => {
        const domain = this.getDomainDisplay().mainName;
        if (domain) {
            return this.viewModel.getDomainByName(domain as DomainName).importanceBullets;
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
        const domainName = this.getDomainDisplay().mainName as DomainName;
        const alreadySelected = this.viewModel.selectedDomains.domains.includes(domainName);
        const hasThreeSelected = this.viewModel.selectedDomains.domains.length == 3;
        return (
            <Button
                title={alreadySelected ? 'Remove' : 'Select'}
                style={styles.domain}
                withBorder
                onPress={() => this.onSelectButtonPressed(domainName)}
                isTransparent={alreadySelected}
                disabled={hasThreeSelected && !alreadySelected}
                icon={alreadySelected ? Images.minusIcon : Images.plusIcon}
                theme={this.theme}
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
                <MasloPage style={[this.baseStyles.page, { paddingBottom: 30 }]} theme={this.theme}>
                    <Container style={[{ height: this._contentHeight, alignItems: 'center' }]}>
                        <View style={[styles.centerFlexColumn, { height: Layout.window.height * 0.25 }]}>
                            {iconForDomain(mainDomain.name, { flex: 1 }, this.theme.colors.highlight, 60, 60, this.theme.colors.highlight)}
                            <Text style={[TextStyles.p1, styles.subdomainTitle, { fontSize: centerDomainFontSize, lineHeight: centerDomainFontSize }]}>{mainDomain.name}</Text>
                        </View>
                        <View style={[styles.centerFlexColumn, { width: '100%', flexGrow: 1 }]}>
                            <FlatList style={styles.subdomainList}
                                data={mainDomain.subdomains}
                                extraData={this.refresh}
                                renderItem={this.renderListItem}
                                keyExtractor={item => item.name} />
                            <Text style={[this.textStyles.p1, styles.descriptionText]}>Select any specific aspects of the {mainDomain.name} life area you’d like to focus on.</Text>
                        </View>
                        <ButtonBlock containerStyles={{ marginTop: 30 }} okTitle={'DONE'} cancelTitle={'BACK'} onCancel={() => this.onCancelSubdomains()} onOk={() => this.onDoneChoosingSubdomains(mainDomain)} nextDisabled={this.checkedSubdomains.length == 0} theme={this.theme} />
                    </Container>
                </MasloPage>
            </Animated.View>
        );
    }

    renderListItem = ({ item }) => (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 }}>
            <TouchableOpacity onPress={() => this.toggleSubdomainCheckbox(item.name)}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <View style={[styles.checkbox, { borderColor: this.theme.colors.highlight }, this.checkedSubdomains.includes(item.name) && { ...styles.checkboxChecked, backgroundColor: this.theme.colors.highlight, }, { display: 'flex' }]}>
                        {this.checkedSubdomains.includes(item.name) && <Images.radioChecked width={8} height={6} fill={this.theme.colors.highlight} />}
                    </View>
                    {iconForDomain(item.name, { marginHorizontal: 15 }, this.theme.colors.highlight)}
                    <Text style={this.textStyles.p2}>{item.name}</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.onSubdomainLearnMorePress(item.name)} hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}>
                <Text style={[TextStyles.labelMedium, { textAlign: 'center', color: this.theme.colors.highlight, paddingRight: 7 }]}>{'Learn\nMore'}</Text>
            </TouchableOpacity>
        </View>
    );

    private toggleSubdomainCheckbox(name: SubdomainName) {
        const index = this.checkedSubdomains.indexOf(name, 0);
        if (index > -1) {
            this.checkedSubdomains.splice(index, 1);
        } else {
            this.checkedSubdomains.push(name);
        }
        this.refresh = !this.refresh;
    }

    private onSubdomainLearnMorePress(name: SubdomainName) {
        this.viewModel.learnMoreSubdomain = this.viewModel.getDomainByName(DomainName.PHYSICAL).subdomains.find((s) => s.name == name);
        this.viewModel.checkedSubdomains = this.checkedSubdomains;
        this.trigger(ScenarioTriggers.Quaternary);
    }

    private onDoneChoosingSubdomains(mainDomain: Domain) {
        this.closePopUp();
        this.selectDomain(mainDomain);
    }

    private onCancelSubdomains() {
        this.checkedSubdomains = [];
        this.closePopUp();
    }

    closePopUp = () => {
        this.showSubdomainPopUp = false;
        this.state.popUpFadeOpacity = new Animated.Value(0.0);
    }
    // End subdomain selection pop up


    public getBottomBannerElement(): JSX.Element {
        let selectionInformation = '';
        switch (this.viewModel.selectedDomains.domains.length) {
            case 1:
                selectionInformation = `You’ve selected ${this.viewModel.selectedDomains.domains[0]}. You can choose up to 2 more.`;
                break;
            case 2:
                selectionInformation = `You’ve selected ${this.viewModel.selectedDomains.domains[0]} and ${this.viewModel.selectedDomains.domains[1]}. You can choose up to 1 more.`;
                break;
            case 3:
                selectionInformation = `You’ve selected ${this.viewModel.selectedDomains.domains[0]}, ${this.viewModel.selectedDomains.domains[1]} and ${this.viewModel.selectedDomains.domains[2]}.`;
                break;
        }
        return (
            <SafeAreaInsetsContext.Consumer>
                {(insets) =>
                    <Animated.View style={{ width: this.layout.window.width, height: 90 + insets.bottom, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: this.theme.colors.tint, position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: insets.bottom }}>
                        <Text style={[this.textStyles.p3, { width: '55%' }]} >{selectionInformation}</Text>
                        <Button title={`I'm Done`} style={{ ...styles.domain, width: '29%', backgroundColor: 'white' }} withBorder titleStyles={{ color: this.theme.colors.highlight }} onPress={() => this.trigger(ScenarioTriggers.Next)} theme={this.theme} />
                    </Animated.View>
                }
            </SafeAreaInsetsContext.Consumer>
        );
    }

    private onSelectButtonPressed(name: DomainName) {
        const domain = this.viewModel.getDomainByName(name);
        if (domain.name == DomainName.PHYSICAL && !this.viewModel.selectedDomains.domains.includes(DomainName.PHYSICAL)) { // If more categories of subdomains (besides Physical) are added this will need to be changed
            this.showSubdomainPopUp = true;
        } else {
            this.selectDomain(domain);
        }
    }

    selectDomain = (domain: Domain) => {
        const didSelectDomain = this.viewModel.selectDomain(domain, () => {
            AppViewModel.Instance.Strategy.setSelectedDomains(this.viewModel.selectedDomains);
        });
        if (!didSelectDomain) {
            if (domain.name == DomainName.PHYSICAL) {
                this.checkedSubdomains = [];
            }
            this.viewModel.removeSelectedDomain(domain, () => {
                AppViewModel.Instance.Strategy.setSelectedDomains(this.viewModel.selectedDomains);
            });
        } else {
            this.viewModel.selectSubdomains(this.checkedSubdomains, () => {
                AppViewModel.Instance.Strategy.setSelectedDomains(this.viewModel.selectedDomains);
            });
        }
        this.setState({ reRenderButton: !this.state.reRenderButton }); // reload the view so button style matches domain selection
        this.showBottomBanner = this.viewModel.selectedDomains.domains.length !== 0 && !this.showSubdomainPopUp;
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
        borderRadius: 5,
        width: '40%',
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        flexShrink: 0,
    },
    checkboxChecked: {
        borderWidth: 0,
    },
    descriptionText: {
        textAlign: 'center',
    },
    centerFlexColumn: {
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    }
});
