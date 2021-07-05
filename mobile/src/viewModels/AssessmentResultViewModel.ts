import { computed } from 'mobx';
import {
    AssessmentType,
    IntakeForms,
    ClientIntakeFormIded,
} from 'common/models';
import AppController from 'src/controllers';
import { arrayCompareG } from 'common/utils/mathx';

export class LastAssessmentResultVieModel {
    constructor(readonly type: AssessmentType) {
        if (!AppController.Instance.User.assessments.responses) {
            throw new Error('Assessments responses are required');
        }
    }

    private get forms() {
        return AppController.Instance.User.assessments.responses?.forms[
            this.type
        ];
    }
    private get formData() {
        return this.type ? IntakeForms[this.type] : null;
    }

    @computed
    public get result() {
        const ee = this.forms?.entries;
        // get the latest entry
        return ee?.length
            ? arrayCompareG<ClientIntakeFormIded>(ee, (c, p) => c.date > p.date)
            : null;
    }

    @computed
    public get score() {
        if (!this.result || !this.formData) {
            return null;
        }

        return this.formData.calculateScores(this.result?.answers);
    }

    @computed
    public get recommendations() {
        if (this.score == null) {
            return null;
        }

        return this.formData.scoreToRecommendation(this.score);
    }

    public get canRetake() {
        return (
            AppController.Instance.User.assessments.isActive(this.type) ||
            !!this.formData.AllowClientRetake
        );
    }
}
