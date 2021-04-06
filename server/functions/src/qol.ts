type createDomainArgs = {
    scope:      string,
    position:   number,
    name:       string,
    slug:       string,
};

type createResult = {
    error: string | null,
};

export async function createDomain(args: createDomainArgs)
    : Promise<createResult> {
    return {
        error: null
    }; // STUB
}

type createQuestionArgs = {
    text: string,
    domainSlug: string,
    position: number,
};

export async function createQuestion(args: createQuestionArgs)
    : Promise<createResult> {
    return {
        error: null
    }; // STUB
}