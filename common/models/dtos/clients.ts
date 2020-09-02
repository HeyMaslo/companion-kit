import {
    CoachClientActions,
    ClientCard,
    ClientAccountIded, ClientCardIded, AssessmentType,
} from '..';

export type ClientsEditAssessment = { type: AssessmentType, active: boolean };

export type ClientsBaseDto = {
    clientCardId: string,
    action: CoachClientActions,
    data?: Partial<ClientCard>,
};

export type ClientsEditAssessmentDto = ClientsBaseDto & { assessment: ClientsEditAssessment};

export type ClientsRequest = ClientsBaseDto | ClientsEditAssessmentDto;

export type ClientsEditAssessmentResponse = { status: boolean, message: string, account?: ClientAccountIded };
export type ClientsMainResponse = ClientCardIded;
export type ClientsResponse = ClientsEditAssessmentResponse | ClientsMainResponse;

export namespace ClientsRequest {
    export function isEditAssessment(r: ClientsRequest): r is ClientsEditAssessmentDto {
        const jed = r as ClientsEditAssessmentDto;
        return !!jed?.assessment;
    }

    export function isValidAssessment(r: ClientsEditAssessment): r is ClientsEditAssessment {
        const jed = r as ClientsEditAssessment;
        return !!jed?.type && jed.active !== undefined;
    }
}
