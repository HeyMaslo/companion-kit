import { observer } from 'mobx-react';
import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button } from 'src/components'
import { DomainName } from 'src/constants/Domain';
import AppViewModel from 'src/viewModels';
import { ScenarioTriggers } from '../../abstractions';
import { ViewDomainsBase } from './viewDomainsBase';

@observer
export class ChooseDomainView extends ViewDomainsBase {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScrollDown({ rotation: -15, transition: { duration: 1}, scale: 1.2});
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
        this.trigger(ScenarioTriggers.Cancel);
    }

    onDetails = () => {
        this.trigger(ScenarioTriggers.Submit);
    }

    public getCenterElement(): JSX.Element {
        const [lDomain, domain, rDomain, importance] = this.getDomainDisplay();
        return(
                <Button
                    title={this.viewModel.selectedDomains.map((s) => s.name).includes(domain as DomainName) && this.viewModel.selectedDomains.length > 0 ? 'Choose Strategies' : 'Select Life Area'}
                    style={styles.domain}
                    onPress={() => this.onSelectDomain(domain)}
                    isTransparent
                />
            );
    }

    onSelectDomain = (n: string) => {
        let hasTwoSelected = this.viewModel.selectedDomains.length == 2;
        let hasThreeSelected = this.viewModel.selectedDomains.length == 3;

        if (hasThreeSelected) {
            Alert.alert(
                'Too Many',
                'Looks like you have already selected three life areas.',
                [{ text: 'Deselct all', onPress: this.clearDomains, style: 'destructive'},
                 { text: 'OK' }]);
        } else if (this.viewModel.selectDomain(this.viewModel.getDomainByName(n as DomainName))) {

            this.viewModel.postSelectedDomains();
            if (hasTwoSelected) {
                this.trigger(ScenarioTriggers.Next);
            } else {
                this.trigger(ScenarioTriggers.Tertiary);
            }
            
        } else if (!this.viewModel.selectDomain(this.viewModel.getDomainByName(n as DomainName))) {
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
        AppViewModel.Instance.Strategy.setSelectedDomains([]);
    }
}

const styles = StyleSheet.create({ 
    domain: {
        height: 50,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: 'rgb(120,120,120)',
        width: '90%',
    },
});
