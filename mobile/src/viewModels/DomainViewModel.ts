import { observable } from 'mobx';
import { createLogger } from 'common/logger';
import { Domain, DomainName, FocusedDomains, SubdomainName } from '../constants/Domain';
import AppViewModel from 'src/viewModels';
import AppController from 'src/controllers';

const logger = createLogger('[DomainViewModel]');

export default class DomainViewModel {

    @observable
    private _mainDomain: number;
    @observable
    private _leftDomain: number;
    @observable
    private _rightDomain: number;

    private _allDomains: Domain[]; // every domain in the domains collection
    private _selectedDomains: FocusedDomains;

    public domainCount: number;

    constructor() {

        this._leftDomain = 0;
        this._mainDomain = 1;
        this._rightDomain = 2;

        this._allDomains = [];
        this._selectedDomains = { domains: [], subdomains: [] };
        this.domainCount = 0;
    }

    public get mainDomain(): Domain {
        return this._allDomains[this._mainDomain];
    }

    public get selectedDomains(): FocusedDomains {
        return this._selectedDomains
    }

    public get allDomains(): Domain[] {
        return this._allDomains;
    }

    public async fetchPossibleDomains() {
        this._allDomains = await AppController.Instance.User.domain.getPossibleDomains();
        this.domainCount = this._allDomains.length;
    }

    public async fetchSelectedDomains() {
        let focusedDomains = await AppController.Instance.User.domain.getFocusedDomains();
        if (focusedDomains) {
            this._selectedDomains = focusedDomains;
        }
    }

    public postSelectedDomains(): Promise<void> {
        return AppController.Instance.User.qol.setUserStateProperty('focusedDomains', this.selectedDomains);
    }

    //  Returns the three domain names displayed on the choose domain screen (main is center domain), along with the importance string of the main domain
    public getDomainDisplay(): string[] {
        if (this.domainCount < 3) {
            logger.log("Warning: not enough domains available!");
            return [null, null, null, null];
        }

        const leftName = this._leftDomain > -1 ? this._allDomains[this._leftDomain].name : '';
        const rightName = this._rightDomain < this.domainCount ? this._allDomains[this._rightDomain].name : '';
        const mainName = this._allDomains[this._mainDomain].name;
        const mainImportance = this._allDomains[this._mainDomain].importance;

        return [leftName, mainName, rightName, mainImportance];
    }

    //  Iterates through the domains as user clicks the next or back button, (-1) going back, (1) going forward through the list of domains
    public moveToNextDomain(dir: number): void {
        if (dir > 0) {
            if (this._rightDomain < this.domainCount) {
                this._rightDomain++;
                this._mainDomain++;
                this._leftDomain++;
            }
        }

        if (dir < 0) {
            if (this._leftDomain >= 0) {
                this._rightDomain--;
                this._mainDomain--;
                this._leftDomain--;
            }
        }
    }

    // adds selected domains by user to the selected domains array, use this array to persist to backend by calling postSelectedDomains
    // returns false if domain has already been selected
    public selectDomain(domain: Domain): Boolean {
        if (this._selectedDomains.domains.includes(domain.name)) {
            return false;
        }
        this._selectedDomains.domains.push(domain.name);
        AppViewModel.Instance.Strategy.setSelectedDomains(this._selectedDomains);
        return true;
    }

    public selectSubdomains(subdomains: SubdomainName[]) {
        this._selectedDomains.subdomains = subdomains; // If more categories of subdomains (besides Physical) are added this will need to be changed
        AppViewModel.Instance.Strategy.setSelectedDomains(this._selectedDomains);
        return true;
    }

    // to persist to backend call postSelectedDomains after calling this function
    public clearSelectedDomains() {
        this._selectedDomains = { domains: [], subdomains: [] };
    }

    public getDomainByName(name: DomainName): Domain {
        for (let i = 0; i < this._allDomains.length; i++) {
            let domain = this._allDomains[i];
            if (domain.name === name) {
                return domain;
            }
        }
        return null;
    }

}

