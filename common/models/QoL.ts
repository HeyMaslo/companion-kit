

/*
    Types definitions for QoL (Quality of Life)
    survey data.
*/

export enum DomainScope {
    GENERAL,
    WORK,
    STUDENT
}

export type LifeDomain = {
    scope:      DomainScope,
    position:   number,
    name:       string,
    slug:       string,
}

// Stub to include some fixed domains. May want
// these to be dynamically added in the future.

export const DOMAINS: LifeDomain[] = [

    {
        scope: DomainScope.GENERAL,
        position: 1,
        name: "Physical",
        slug: "physical"
    },

    {
        scope: DomainScope.GENERAL,
        position: 2,
        name: "Sleep",
        slug: "sleep"
    },

    {
        scope: DomainScope.GENERAL,
        position: 3,
        name: "Mood",
        slug: "mood"
    },

    // TODO: add the rest

]