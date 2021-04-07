

/*
    Types definitions for QoL (Quality of Life)
    survey data.
*/

import { Identify } from "common/models";

export enum DomainScope {
    GENERAL ='GENERAL',
    WORK    ='WORK',
    STUDENT ='STUDENT',
}

export type Domain = {
    scope:      DomainScope,
    position:   number,
    name:       string,
    slug:       string,
}

export type DomainIded = Identify<Domain>;

// // Stub to include some fixed domains. May want
// // these to be dynamically added in the future.

// export const DOMAINS: Domain[] = [

//     {
//         scope: DomainScope.GENERAL,
//         position: 1,
//         name: "Physical",
//         slug: "physical"
//     },

//     {
//         scope: DomainScope.GENERAL,
//         position: 2,
//         name: "Sleep",
//         slug: "sleep"
//     },

//     {
//         scope: DomainScope.GENERAL,
//         position: 3,
//         name: "Mood",
//         slug: "mood"
//     },

//     // TODO: add the rest

// ]

export type Question = {
    domainId:   string, // reference to single domain
    text:       string,
    position:   number
}

export type QuestionIded = Identify<Question>;
