import { Question } from '../../../mobile/src/constants/QoL';
import { Domain, DomainName } from '../../../mobile/src/constants/Domain';

export enum QoLActionTypes {
    CreateDomain = 'createDomain',
    GetDomains = 'getDomains',
    CreateQuestion = 'createQuestion',
    GetQuestions = 'getQuestions',
}

type CreateDomainArgs = {
    scope:      string,
    position:   number,
    name:       DomainName,
    slug:       string,
    importance: string,
};

type GetDomainsArgs = {};

type CreateQuestionArgs = {
    text: string,
    domainSlug: string,
    position: number,
};

type GetQuestionsArgs = {};

export type CreateDomainRequest = CreateDomainArgs & { type: QoLActionTypes.CreateDomain };
export type GetDomainsRequest = GetDomainsArgs & { type: QoLActionTypes.GetDomains };
export type CreateQuestionRequest = CreateQuestionArgs & { type: QoLActionTypes.CreateQuestion };
export type GetQuestionsRequest = GetQuestionsArgs & { type: QoLActionTypes.GetQuestions };

export type QoLRequest
    = CreateDomainRequest
    | GetDomainsRequest
    | CreateQuestionRequest
    | GetQuestionsRequest ;

type BaseResponse = {
    error?: string,
};

type GetManyResponse<T> = BaseResponse & { results: T[] };

export type CreateDomainResponse = BaseResponse;
export type CreateQuestionResponse = BaseResponse;
export type GetDomainsResponse = GetManyResponse<Domain>;
export type GetQuestionsResponse = GetManyResponse<Question>;

export type QoLResponse = CreateDomainResponse
    | GetDomainsResponse
    | CreateQuestionResponse
    | GetQuestionsResponse ;