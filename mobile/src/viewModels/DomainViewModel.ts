import { observable } from 'mobx';
import { createLogger } from 'common/logger';
import { Domain, DomainName, DomainSlug, FocusedDomains, Subdomain, SubdomainName } from '../constants/Domain';
import AppController from 'src/controllers';

const logger = createLogger('[DomainViewModel]');

export default class DomainViewModel {

    @observable
    private _mainDomain: number;
    @observable
    private _leftDomain: number;
    @observable
    private _rightDomain: number;

    private _allDomains: Domain[]; // every Domain in the domains collection
    private _selectedDomains: FocusedDomains;

    public domainCount: number;

    public learnMoreSubdomain: Subdomain = null;
    public checkedSubdomains: DomainSlug[] = []; // used to persist subdomain checkboxes when moving to and from subdomain 'Learn More' View 

    constructor() {

        this._leftDomain = -1;
        this._mainDomain = 0;
        this._rightDomain = 1;

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
        return await AppController.Instance.User.domain.getPossibleDomains().then((fetchedDoms) => {
            this._allDomains = fetchedDoms;
            this.domainCount = this._allDomains.length;
        })
    }

    public async fetchSelectedDomains() {
        let focusedDomains = await AppController.Instance.User.domain.getFocusedDomains();
        if (focusedDomains) {
            this._selectedDomains = focusedDomains;
        }
    }

    public postFocusedDomains(): Promise<void> {
        let focusedDomains: FocusedDomains = {
            domains: this.selectedDomains.domains,
            subdomains: this.selectedDomains.subdomains,
        }
        return AppController.Instance.User.qol.setUserStateProperty('focusedDomains', focusedDomains);
    }

    //  Returns the three domain names displayed on the choose domain screen (main is center domain), along with the importance string of the main domain
    public getDomainDisplay(): { leftName: string, mainName: string, mainSlug: DomainSlug, rightName: string, mainImportance: string, subdomains: Subdomain[] } {
        if (this.domainCount < 3) {
            logger.log("Warning: not enough domains available!");
            return { leftName: null, mainName: null, mainSlug: null, rightName: null, mainImportance: null, subdomains: null };
        }

        const leftName = this._leftDomain > -1 ? this._allDomains[this._leftDomain].name : '';
        const rightName = this._rightDomain < this.domainCount ? this._allDomains[this._rightDomain].name : '';
        const mainName = this._allDomains[this._mainDomain].name;
        const mainSlug = this._allDomains[this._mainDomain].slug;
        const mainImportance = this._allDomains[this._mainDomain].importance;
        const subdomains = this._allDomains[this._mainDomain].subdomains;

        return { leftName: leftName, mainName: mainName, mainSlug: mainSlug, rightName: rightName, mainImportance: mainImportance, subdomains: subdomains };
    }

    //  Iterates through the domains as user clicks the next or back button, (-1) going back, (1) going forward through the list of domains
    public moveToNextDomain(direction: number): void {
        if (direction > 0) {
            if (this._rightDomain < this.domainCount) {
                this._rightDomain++;
                this._mainDomain++;
                this._leftDomain++;
            }
        }

        if (direction < 0) {
            if (this._leftDomain >= 0) {
                this._rightDomain--;
                this._mainDomain--;
                this._leftDomain--;
            }
        }
    }

    // adds selected domains by user to the selected domains array, use this array to persist to backend by calling postFocusedDomains
    // returns false if domain has already been selected
    // Use callback to set selected domains in StrategiesViewModel
    public selectDomain(domain: Domain, callback: () => void): boolean {
        if (this._selectedDomains.domains.includes(domain.slug)) {
            return false;
        }
        this._selectedDomains.domains.push(domain.slug);
        callback();
        return true;
    }

    // if the selected domains array contains domain remove it, use this array to persist to backend by calling postFocusedDomains
    // Use callback to set selected domains in StrategiesViewModel
    public removeSelectedDomain(domain: Domain, callback: () => void) {
        // If we are removing the Physical Domain, remove all of the selected subdomains
        if (domain.name == DomainName.PHYSICAL) {
            this._selectedDomains.subdomains = [];
        }
        const oldLength = this._selectedDomains.domains.length;
        this._selectedDomains.domains = this._selectedDomains.domains.filter((slug) => slug !== domain.slug)
        if (this._selectedDomains.domains.length != oldLength) {
            callback();
        }
    }

    // Use callback to set selected domains in StrategiesViewModel
    public selectSubdomains(subdomains: DomainSlug[], callback: () => void) {
        this._selectedDomains.subdomains = subdomains; // If more categories of subdomains (besides Physical) are added this will need to be changed
        callback();
        return true;
    }

    // to persist to backend call postFocusedDomains after calling this function
    public clearSelectedDomains() {
        this._selectedDomains = { domains: [], subdomains: [] };
    }

    public getDomainBySlug(slug: DomainSlug): Domain {
        for (let i = 0; i < this._allDomains.length; i++) {
            let domain = this._allDomains[i];
            if (domain.slug === slug) {
                return domain;
            }
        }
        return null;
    }

    public completeDomainOnboarding() {
        AppController.Instance.User.localSettings.updateOnboardingSettings({ needsDomainOnboarding: false }, 'needsDomainOnboarding');
    }

}

