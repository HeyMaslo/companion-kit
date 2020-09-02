import { observable } from 'mobx';
import * as ViewModels from 'common/viewModels';
import { EnumStringHelper } from 'common/utils/enumHelper';
import Localization from 'app/services/localization';

export enum BubbleChartSelect {
    Things = 'Things',
    People = 'People',
    Places = 'Places',
}

export namespace BubbleChartSelect {
    export const Helper = new EnumStringHelper<BubbleChartSelect>(BubbleChartSelect);
}

const BubbleCHartEnumStrings = {
    [BubbleChartSelect.People]: Localization.Current.BubbleChartStatus.People,
    [BubbleChartSelect.Places]: Localization.Current.BubbleChartStatus.Places,
    [BubbleChartSelect.Things]: Localization.Current.BubbleChartStatus.Things,
};

export default class BubbleChartViewModel {

    @observable
    readonly statusSelect = new ViewModels.Select<BubbleChartSelect>(BubbleChartSelect.Helper.Values, cs => BubbleCHartEnumStrings[cs]);

    get status() {
        return this.statusSelect.selectedItem;
    }

    get clients() {
        return this.status;
    }

    // private getClient(id: string) {
    //     return AppController.Instance.User.clients.all.find(c => c.id === id);
    // }
}
