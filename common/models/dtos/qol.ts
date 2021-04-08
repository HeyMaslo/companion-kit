import { Domain } from "common/models/QoL";

export enum QoLActionTypes {
    CreateDomain = 'createDomain',
    GetDomains = 'getDomains',
    CreateQuestion = 'createQuestion'
}

type CreateDomainArgs = {
    scope:      string,
    position:   number,
    name:       string,
    slug:       string,
};

type GetDomainsArgs = {};

type CreateQuestionArgs = {
    text: string,
    domainSlug: string,
    position: number,
};

export type CreateDomainRequest = CreateDomainArgs & { type: QoLActionTypes.CreateDomain };
export type GetDomainsRequest = GetDomainsArgs & { type: QoLActionTypes.GetDomains };
export type CreateQuestionRequest = CreateQuestionArgs & { type: QoLActionTypes.CreateQuestion };

export type QoLRequest
    = CreateDomainRequest
    | GetDomainsRequest
    | CreateQuestionRequest ;

type BaseResponse = {
    error?: string,
};

type GetManyResponse<T> = BaseResponse & { results: T[] };

export type CreateDomainResponse = BaseResponse;
export type CreateQuestionResponse = BaseResponse;
export type GetDomainsResponse = GetManyResponse<Domain>;

export type QoLResponse = CreateDomainResponse
    | GetDomainsResponse
    | CreateQuestionResponse;