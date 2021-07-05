import { observable, computed } from 'mobx';
import AppController from 'src/controllers';
import { InterventionTipsStatuses } from 'common/models';
import { IInterventionTipItem } from 'src/viewModels/components/TipItemViewModel';

export default class InterventionTipsViewModel {
    @observable
    private readonly _hidedTips: Record<string, boolean> = {};

    @computed
    public get tips(): ReadonlyArray<IInterventionTipItem> {
        const availableTips =
            AppController.Instance.User?.prompts?.availableTips;
        if (!availableTips?.length) {
            return null;
        }

        return availableTips
            .filter((tip) => !this._hidedTips[tip.id])
            .map((tip) => ({
                ...tip,
                type: 'interventionTip',
                title: tip.text,
                actions: {
                    wontDo: () =>
                        this.setStatus(
                            tip.id,
                            InterventionTipsStatuses.StatusIds.WontDo,
                        ),
                    didntDo: () =>
                        this.setStatus(
                            tip.id,
                            InterventionTipsStatuses.StatusIds.DidntDo,
                        ),
                    willDo: () =>
                        this.setStatus(
                            tip.id,
                            InterventionTipsStatuses.StatusIds.WillDo,
                        ),
                    done: () =>
                        this.setStatus(
                            tip.id,
                            InterventionTipsStatuses.StatusIds.Done,
                        ),
                    seen: () =>
                        this.setStatus(
                            tip.id,
                            InterventionTipsStatuses.StatusIds.NoResponse,
                        ),
                },
            }));
    }

    private setStatus = async (
        id: string,
        status: InterventionTipsStatuses.StatusIds,
    ) => {
        if (
            status === InterventionTipsStatuses.StatusIds.Done ||
            status === InterventionTipsStatuses.StatusIds.WontDo ||
            status === InterventionTipsStatuses.StatusIds.DidntDo
        ) {
            this._hidedTips[id] = true;
        }
        await AppController.Instance.User.prompts.setTipStatus(status, id);
    };
}
