import { observable} from 'mobx';
import AppController from 'src/controllers';
import { Domains,Domain_Importance, DOMAIN_COUNT } from "../constants/QoLSurvey";
import { createLogger } from 'common/logger';

export const logger = createLogger('[QOLModel]');

export default class ChooseDomainViewModel {

    @observable
    private _mainDomain: number;
    @observable
    private _leftDomain: number;
    @observable
    private _rightDomain: number;
    

    public _selectedDomains: any;


    public domainCount: number = DOMAIN_COUNT;


    constructor() {

        this._mainDomain = 1;
        this._rightDomain = 2;
        this._leftDomain = 0;

        const selectedDomains = [];
        this._selectedDomains = selectedDomains;
    }

    // @computed
    get SelectedDomain (): any {return this._selectedDomains};

    public getDomainDisplay () : string[] {
        return [Domains[this._leftDomain], 
        Domains[this._mainDomain], 
        Domains[this._rightDomain],
        Domain_Importance[this._mainDomain]];
    }

    public getNextDomain (dir:number) : void {
        if (dir > 0){
            if (!((this._rightDomain + 1) > (DOMAIN_COUNT))) {
                this._rightDomain++;
                this._mainDomain++;
                this._leftDomain++;
            }
        }

        if (dir < 0){
            if (!((this._leftDomain - 1) < -1)) {
                this._rightDomain--;
                this._mainDomain--;
                this._leftDomain--;
            }

        }
    }

    public selectDomain(domain: string): void {
        this._selectedDomains.push(domain);
    }

}

