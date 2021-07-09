import { observable} from 'mobx';
import { createLogger } from 'common/logger';
import { DomainIded } from '../../../mobile/src/constants/Domain';
import AppViewModel from 'src/viewModels';

const logger = createLogger('[ChooseDomainViewModel]');

export default class ChooseDomainViewModel {

    @observable
    private _mainDomain: number;
    @observable
    private _leftDomain: number;
    @observable
    private _rightDomain: number;
    
    public _availableDomains: DomainIded[];
    private _selectedDomains: DomainIded[];

    public domainCount: number;

    constructor() {

        this._leftDomain = 0;
        this._mainDomain = 1;
        this._rightDomain = 2;

        this._availableDomains = [];
        this._selectedDomains = [];
        this.domainCount = 0;
    }

    public setAvailableDomains(doms: DomainIded[]) {
        this._availableDomains = doms;
        this.domainCount = doms.length;
    }

    get selectedDomains(): DomainIded[] { return this._selectedDomains };

    //  Returns the three domains displayed on the choose domain screen, main(center donain), ldomain(domain on left side), rdomain(domain on right side)
    public getDomainDisplay(): string[] {
        if (this.domainCount < 3) {
            logger.log("Warning: not enough domains available!");
            return [null, null, null, null];
        }

        const leftName = this._leftDomain > -1 ? this._availableDomains[this._leftDomain].name : '';
        const rightName = this._rightDomain < this._availableDomains.length ? this._availableDomains[this._rightDomain].name : '';
        const mainName = this._availableDomains[this._mainDomain].name;
        const mainImportance = this._availableDomains[this._mainDomain].importance;

        return [leftName, mainName, rightName, mainImportance];
    }

    //  Iterates through the domains as user clicks the next or back button, (-1) going back, (1) going forward through the list of domains
    public getNextDomain(dir: number): void {
        if (dir > 0){
            if (this._rightDomain < this.domainCount) {
                this._rightDomain++;
                this._mainDomain++;
                this._leftDomain++;
            }
        }

        if (dir < 0){
            if (this._leftDomain >= 0) {
                this._rightDomain--;
                this._mainDomain--;
                this._leftDomain--;
            }

        }
    }

    // adds selected domains by user to the selected domains array, use this array to persist to backend
    // returns false if domain has already been selected
    public selectDomain(domain: DomainIded): Boolean {
        if (this._selectedDomains.map(d => d.id).includes(domain.id)) {
            return false;
        }
        this._selectedDomains.push(domain);
        AppViewModel.Instance.ChooseStrategy.setSelectedDomains(this._selectedDomains);
        return true;
    }

    public clearSelectedDomains() {
        this._selectedDomains = [];
        AppViewModel.Instance.ChooseStrategy.setSelectedDomains(this._selectedDomains);
    }

    public getDomainByName(name: string): DomainIded {
        let dom: DomainIded = null;
        this._availableDomains.forEach(d => {
            if (d.name === name) {
                dom = d;
            }
        });
        return dom;
    }

}

