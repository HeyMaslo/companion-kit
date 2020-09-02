import { ClientIntakeForm, ClientIntakeFormIded } from 'common/models/ClientAssessments';

export type IntakeFormBaseDto = {
    accountId: string,
};

export type SubmitFormDto = IntakeFormBaseDto & { entry: ClientIntakeForm };

export type IntakeFormsResponse = ClientIntakeFormIded;

export type IntakeFormsRequest = SubmitFormDto;

export namespace IntakeFormsRequest {
    export function isCreate(r: IntakeFormsRequest): r is SubmitFormDto {
        const qud = r as SubmitFormDto;
        return !!qud?.entry;
    }
}
