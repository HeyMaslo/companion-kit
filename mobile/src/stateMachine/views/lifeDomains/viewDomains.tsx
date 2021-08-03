import { observer } from 'mobx-react';
import { ScenarioTriggers } from '../../abstractions';
import { ViewDomainsBase } from './viewDomainsBase';
import AppViewModel from 'src/viewModels';
import { DomainName } from 'src/constants/Domain';

@observer
export class ViewDomainsView extends ViewDomainsBase {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScrollDown({ rotation: -15, transition: { duration: 1}, scale: 1.2});
    }

    private get viewModel() {
      return AppViewModel.Instance.Domain;
  }

    async start() {
        this.viewModel.requestPossibleDomains();
        this.forceUpdate();
    }

    onBack = () => {
      this.trigger(ScenarioTriggers.Back);
    }

    onCancel = null;

    onDetails = () => {
      this.trigger(ScenarioTriggers.Tertiary);
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
      this.viewModel.getNextDomain(1);
    }

    goToLeft = () => {
      this.viewModel.getNextDomain(-1);
    }

}
