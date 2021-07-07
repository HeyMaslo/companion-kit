import { observer } from 'mobx-react';
import AppController from 'src/controllers';
import { ScenarioTriggers } from '../../abstractions';
import ChooseDomainViewModel from 'src/viewModels/ChooseDomainViewModel';
import { ViewDomainsBase } from './viewDomainsBase';

@observer
export class ViewDomainsView extends ViewDomainsBase {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScrollDown({ rotation: -15, transition: { duration: 1}, scale: 1.2});
    }

    private viewModel = new ChooseDomainViewModel();

    async start() {
        let possibleDomains = await AppController.Instance.User.backend.getPossibleDomains();
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

    onDetails = () => {
        this.trigger(ScenarioTriggers.Submit);
    }
}
