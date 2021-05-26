import { observable} from 'mobx';
import { createLogger } from 'common/logger';
import { DomainIded } from 'common/models/QoL';

export const logger = createLogger('[QOLModel]');

export default class ChooseDomainViewModel {

    @observable
    private _mainDomain: number;
    @observable
    private _leftDomain: number;
    @observable
    private _rightDomain: number;
    

    public _availableDomains: DomainIded[];
    public _selectedDomains: DomainIded[];


    public domainCount: number;


    constructor() {

        this._mainDomain = 1;
        this._rightDomain = 2;
        this._leftDomain = 0;

        this._availableDomains = [];
        this._selectedDomains = [];
        this.domainCount = 0;
    }

    public setAvailableDomains(doms: DomainIded[]) {
        this._availableDomains = doms;
        this.domainCount = doms.length;
        console.log("available domains: ", this._availableDomains.map(d => d.slug));
    }

    // @computed
    get SelectedDomain (): any {return this._selectedDomains};

    //  Returns the three domains displayed on the choose domain screen, main(center donain), ldomain(domain on left side), rdomain(domain on right side)
    public getDomainDisplay () : string[] {
        if (this.domainCount < 3) {
            console.log("Warning: not enough domains available!");
            return [null, null, null, null];
        }
        console.log("indices", this._leftDomain, this._mainDomain, this._rightDomain);
        return [this._availableDomains[this._leftDomain].name,
        this._availableDomains[this._mainDomain].name,
        this._availableDomains[this._rightDomain].name,
        this._availableDomains[this._mainDomain].importance];
    }

    //  Iterates through the domains as user clicks the next or back button, (-1) going back, (1) going forward through the list of domains
    public getNextDomain (dir:number) : void {
        if (dir > 0){
            if (this._rightDomain + 1 < this.domainCount) {
                this._rightDomain++;
                this._mainDomain++;
                this._leftDomain++;
            }
        }

        if (dir < 0){
            if (this._leftDomain - 1 >= 0) {
                this._rightDomain--;
                this._mainDomain--;
                this._leftDomain--;
            }

        }
    }

    // adds selected domains by user to the selected domains array, use this array to persist to backend
    public selectDomain(domain: string): Boolean {
        if (this._selectedDomains.includes(domain)) {
            return false;
        } 
        this._selectedDomains.push(domain);
        return true;
    }

}

