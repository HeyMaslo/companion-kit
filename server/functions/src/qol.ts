import { DomainScope, Domain } from 'common/models/QoL';
import RepoFactory from 'common/controllers/RepoFactory';
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
} from 'common/models/dtos/qol';

export const QoLEndpoint = new FunctionFactory(QoLFunctions.QoLEndpoint)
    .create(async (data, ctx) => {
        switch (data.type) {
            case QoLActionTypes.CreateDomain:
                return createDomain(data);
            case QoLActionTypes.GetDomains:
                return getDomains();
            case QoLActionTypes.CreateQuestion:
                return createQuestion(data);
        }
    });

export async function createDomain(args: CreateDomainRequest)
    : Promise<CreateDomainResponse> {
    
    if (args.scope in DomainScope) {
        await RepoFactory.Instance.domains.create({
            scope:      args.scope as DomainScope,
            position:   args.position,
            name:       args.name,
            slug:       args.slug,
        })
        return {
            error: null
        };
    } else {
        return {
            error: "Invalid scope"
        }
    }
}

export async function getDomains(): Promise<GetDomainsResponse> {
    return {
        error: null,
        results: await RepoFactory.Instance.domains.get()
    };
}

export async function createQuestion(args: CreateQuestionRequest)
    : Promise<CreateQuestionResponse> {
    return {
        error: null
    }; // STUB
}

export const Functions = {
    [QoLEndpoint.Definition.Name]: QoLEndpoint.Function,
};