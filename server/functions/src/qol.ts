import { DomainScope, Domain } from 'common/models/QoL';
import RepoFactory from 'common/controllers/RepoFactory';
import { Identify } from 'common/models';

type CreateDomainArgs = {
    scope:      string,
    position:   number,
    name:       string,
    slug:       string,
};

type Error = string | null;

type CreateResult = {
    error: Error,
};

type GetManyResult<T> = {
    error: Error,
    results: T[]
}

export async function createDomain(args: CreateDomainArgs)
    : Promise<CreateResult> {
    
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

export async function getDomains()
    : Promise<GetManyResult<Identify<Domain>>> {

    return {
        error: null,
        results: await RepoFactory.Instance.domains.get()
    };
}

type CreateQuestionArgs = {
    text: string,
    domainSlug: string,
    position: number,
};

export async function createQuestion(args: CreateQuestionArgs)
    : Promise<CreateResult> {
    return {
        error: null
    }; // STUB
}