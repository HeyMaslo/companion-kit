import { observer } from 'mobx-react';
import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button } from 'src/components'
import AppController from 'src/controllers';
import { mainFontMedium } from 'src/styles/TextStyles';
import AppViewModel from 'src/viewModels';
import { ScenarioTriggers } from '../../abstractions';
import { ViewDomainsBase } from './viewDomainsBase';

@observer
export class ChooseDomainView extends ViewDomainsBase {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScrollDown({ rotation: -15, transition: { duration: 1}, scale: 1.2});
    }

    public get viewModel() {
        return AppViewModel.Instance.ChooseDomain;
    }

    async start() {
        let possibleDomains = await AppController.Instance.User.domain.getPossibleDomains();
        this.viewModel.setAvailableDomains(possibleDomains);
        this.forceUpdate();
    }

    getDomainDisplay = (): string[] => {
        return this.viewModel.getDomainDisplay();
      }

    goToRight = () => {
        this.viewModel.getNextDomain(1);
    }

    goToLeft = () => {
        this.viewModel.getNextDomain(-1);
    }

    onBack = () => {
        this.trigger(ScenarioTriggers.Back);
    }
  
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
                    title={this.viewModel.selectedDomains.map((s) => s.slug).includes(domain) && this.viewModel.selectedDomains.length > 1 ? 'Choose Strategies' : 'Select Life Area'}
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
                'Looks like you have already selected three domains.',
                [
                    { text: 'Deselct all', onPress: this.clearDomains, style: 'destructive'},
                    { text: 'OK' },
                ]);
        } else if ((hasTwoSelected || hasThreeSelected) && !this.viewModel.selectDomain(this.viewModel.getDomainByName(n))) {
            this.trigger(ScenarioTriggers.Tertiary);
        } else if (this.viewModel.selectDomain(this.viewModel.getDomainByName(n))) {
            AppController.Instance.User.qol.setUserStateProperty('focusDomains', this.viewModel.selectedDomains.map(d => d.id));
            hasTwoSelected ? this.trigger(ScenarioTriggers.Next) : this.trigger(ScenarioTriggers.Tertiary);
        } else {
            Alert.alert(
                'Oops',
                'Looks like you have already selected that domain.',
                [
                    { text: 'OK' },
                ]);
        }
    }

    private clearDomains = () => {
        this.viewModel.clearSelectedDomains();
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
