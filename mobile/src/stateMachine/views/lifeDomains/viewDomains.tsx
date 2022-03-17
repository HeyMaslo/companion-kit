import { observer } from 'mobx-react';
import { ScenarioTriggers } from '../../abstractions';
import { ViewDomainsBase } from './viewDomainsBase';
import AppViewModel from 'src/viewModels';
import { DomainName, DomainSlug, Subdomain } from 'src/constants/Domain';

@observer
export class ViewDomainsView extends ViewDomainsBase {
  constructor(props) {
    super(props);
    this._contentHeight = this.persona.setupContainerHeightForceScrollDown({ rotation: -15, transition: { duration: 1 }, scale: 1.2 });
  }

  private get viewModel() {
    return AppViewModel.Instance.Domain;
  }

  async start() { }

  onBack = () => {
    this.trigger(ScenarioTriggers.Back);
  }

  onCancel = null;

  onDetails = () => {
    this.trigger(ScenarioTriggers.Tertiary);
  }

  getDomainDisplay = (): { leftName: string, mainName: string, mainSlug: DomainSlug, rightName: string, mainImportance: string, subdomains: Subdomain[] } => {
    return this.viewModel.getDomainDisplay();
  }

  getDomainImportanceBullets = (): string[] => {
    const domain = this.viewModel.getDomainDisplay().mainSlug
    if (domain) {
      return this.viewModel.getDomainBySlug(domain).importanceBullets;
    }
    return [];
  }

  goToRight = () => {
    this.viewModel.moveToNextDomain(1);
  }

  goToLeft = () => {
    this.viewModel.moveToNextDomain(-1);
  }

}
