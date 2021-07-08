import { observer } from 'mobx-react';
import AppController from 'src/controllers';
import { ScenarioTriggers } from '../../abstractions';
import ChooseDomainViewModel from 'src/viewModels/ChooseDomainViewModel';
import { ViewDomainsBase } from './viewDomainsBase';
import React from 'react';
import { View } from 'react-native';
import { iconForDomain } from 'src/constants/Domain';
import { TextStyles } from 'src/styles/BaseStyles';

@observer
export class ViewDomainsView extends ViewDomainsBase {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScrollDown({ rotation: -15, transition: { duration: 1}, scale: 1.2});
    }

    private viewModel = new ChooseDomainViewModel();

    async start() {
        let possibleDomains = await AppController.Instance.User.domain.getPossibleDomains();
        this.viewModel.setAvailableDomains(possibleDomains);
        this.forceUpdate();
    }

    public getDomainDisplay = (): string[] => {
      return this.viewModel.getDomainDisplay();
    }

    public goToRight = () => {
      this.viewModel.getNextDomain(1);
    }

    public goToLeft = () => {
      this.viewModel.getNextDomain(-1);
    }

    public getCenterElement(): JSX.Element {
      return(
        <View style={{justifyContent: 'center', marginLeft: 'auto', marginRight: 'auto', marginTop: 50, marginBottom: 50}}>
            {iconForDomain(this.getDomainDisplay()[1], null, TextStyles.h1.color, 60, 60)}
        </View>
        );
  }

    onDetails = () => {
        this.trigger(ScenarioTriggers.Submit);
    }
}
