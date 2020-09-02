import { observable, autorun, reaction } from 'mobx';
import * as ViewModels from 'common/viewModels';
import { dayMS } from 'common/utils/dateHelpers';

const defPeriods = [15, 30];

type WithDate = {
    date: number;
};

export default class DateFilterable<TItem extends WithDate> {
    @observable
    private _dateRangeSelect = new ViewModels.Select<number>(defPeriods, (i) => `Last ${i} days`);

    private dateFilter = (el: TItem, index: number) => {
        const selectedDays = this._dateRangeSelect.selectedItem;
        const nowMS = new Date().getTime();

        return el.date > (nowMS - selectedDays * dayMS);
    }
}