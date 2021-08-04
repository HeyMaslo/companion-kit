import { observable } from 'mobx';
import { createLogger } from 'common/logger';
import { DomainIded, DomainName } from '../constants/Domain';
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

    private _allDomains: DomainIded[]; // every domain in the domains collection
    private _selectedDomains: DomainIded[];

    public domainCount: number;

    constructor() {

        this._leftDomain = 0;
        this._mainDomain = 1;
        this._rightDomain = 2;

        this._allDomains = [];
        this._selectedDomains = [];
        this.domainCount = 0;
    }

    public get selectedDomains(): DomainIded[] {
        return this._selectedDomains
    }

    public get allDomains(): DomainIded[] {
        return this._allDomains;
    }

    public async requestSelectedDomains() {
        let focusedDomains = await AppController.Instance.User.domain.getFocusedDomains();
        this._selectedDomains = focusedDomains.map((name) => this.getDomainByName(name));
    }

    public postSelectedDomains(): Promise<void> {
        return AppController.Instance.User.qol.setUserStateProperty('focusedDomains', this.selectedDomains.map(d => d.name));
    }

    public async requestPossibleDomains() {
        this._allDomains = await AppController.Instance.User.domain.getPossibleDomains();
        this.domainCount = this._allDomains.length;
    }

    //  Returns the three domains displayed on the choose domain screen, main(center donain), ldomain(domain on left side), rdomain(domain on right side)
    public getDomainDisplay(): string[] {
        if (this.domainCount < 3) {
            logger.log("Warning: not enough domains available!");
            return [null, null, null, null];
        }

        const leftName = this._leftDomain > -1 ? this._allDomains[this._leftDomain].name : '';
        const rightName = this._rightDomain < this._allDomains.length ? this._allDomains[this._rightDomain].name : '';
        const mainName = this._allDomains[this._mainDomain].name;
        const mainImportance = this._allDomains[this._mainDomain].importance;

        return [leftName, mainName, rightName, mainImportance];
    }

    //  Iterates through the domains as user clicks the next or back button, (-1) going back, (1) going forward through the list of domains
    public getNextDomain(dir: number): void {
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
    public selectDomain(domain: DomainIded): Boolean {
        if (this._selectedDomains.map(d => d.id).includes(domain.id)) {
            return false;
        }
        this._selectedDomains.push(domain);
        AppViewModel.Instance.Strategy.setSelectedDomains(this._selectedDomains);
        return true;
    }

    public clearSelectedDomains() {
        this._selectedDomains = [];
        AppViewModel.Instance.Strategy.setSelectedDomains(this._selectedDomains);
    }

    public getDomainByName(name: DomainName): DomainIded {
        let dom: DomainIded = null;
        this._allDomains.forEach(d => {
            if (d.name === name) {
                dom = d;
            }
        });
        return dom;
    }

}

