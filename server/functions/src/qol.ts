import { DomainScope, Domain } from '../../../mobile/src/constants/Domain';
import { Repo } from './services/db';
import { Identify } from 'common/models';
import { QoL as QoLFunctions } from 'common/abstractions/functions';
import { FunctionFactory } from 'server/utils/createFunction';
import {
    QoLActionTypes,
    CreateDomainRequest,
    CreateDomainResponse,
    GetDomainsRequest,
    GetDomainsResponse,
    CreateQuestionRequest,
    CreateQuestionResponse,
    GetQuestionsResponse,
    GetQuestionsRequest,
} from 'common/models/dtos/qol';
import { Maybe, wrapAsync } from 'common/abstractions/structures/monads';

export const QoLEndpoint = new FunctionFactory(QoLFunctions.QoLEndpoint)
    .create(async (data, ctx) => {
        switch (data.type) {
            case QoLActionTypes.CreateDomain:
                return createDomain(data);
            case QoLActionTypes.GetDomains:
                return getDomains();
            case QoLActionTypes.CreateQuestion:
                return createQuestion(data);
            default:
                return {
                    error: 'invalid action',
                };
        }
    });

export async function createDomain(args: CreateDomainRequest)
    : Promise<CreateDomainResponse> {

    if (args.scope in DomainScope) {
        await Repo.Domains.create({
            scope:      args.scope as DomainScope,
            position:   args.position,
            name:       args.name,
            slug:       args.slug,
            importance: args.importance,
        });
        return {
            error: null,
        };
    } else {
        return {
            error: 'Invalid scope',
        };
    }
}

export async function getDomains(): Promise<GetDomainsResponse> {
    return {
        error: null,
        results: await Repo.Domains.get(),
    };
}

export async function createQuestion(args: CreateQuestionRequest)
    : Promise<CreateQuestionResponse> {
    const dom: Maybe<Domain> = await Repo.Domains.getBySlug(args.domainSlug);
    return await wrapAsync<Domain, CreateQuestionResponse>(dom, async () => {
        await Repo.Questions.create({
            domainId: dom.slug,
            text: args.text,
            position: args.position,
        });
        return {
            error: null,
        };
    }, async () => {
        return {
            error: 'Domain with slug does not exist',
        };
    });
}

export async function getQuestions(args: GetQuestionsRequest): Promise<GetQuestionsResponse> {
    return {
        error: null,
        results: await Repo.Questions.get(),
    };
}

export const Functions = {
    [QoLEndpoint.Definition.Name]: QoLEndpoint.Function,
};