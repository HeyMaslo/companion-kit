
enum Collections {
    Users = 'users',
    Coaches = 'coaches',
    Clients = 'clients',
    Invites = 'invitations',
    Records = 'records',
    Config = 'config',
    Prompts = 'prompts',
    Tips = 'tips',
    LocalSettings = 'localSettings',
    ServiceJobs = 'serviceJobs',
    Generic = 'generic',
    SurveyResults = 'surveyResults',
    Domains = 'domains',
    Questions = 'questions',
    UserState = 'userState',
    Strategies = 'strategies',
}

namespace Collections {
    export const coachClients = (coachId: string) => `${Collections.Coaches}/${coachId}/clients`;
    export const clientAccounts = (clientId: string) => `${Collections.Clients}/${clientId}/accounts`;
    export const clientJournalEntries = (clientId: string, accountId: string) =>
        `${clientAccounts(clientId)}/${accountId}/journal`;
    export const clientIntakeForms = (clientId: string, accountId: string) =>
        `${clientAccounts(clientId)}/${accountId}/intakeforms`;
    export const insightsFeedback = (coachId: string, clientCardId: string) => `${coachClients(coachId)}/${clientCardId}/insights`;
    export const clientEvents = (clientId: string, accountId: string) =>
        `${clientAccounts(clientId)}/${accountId}/events`;

    export const sessions = (coachId: string, clientCardId: string) => `${coachClients(coachId)}/${clientCardId}/sessions`;
    export const documents = (coachId: string, clientCardId: string) => `${coachClients(coachId)}/${clientCardId}/documents`;
    export const timeTracking = (coachId: string, clientCardId: string) => `${coachClients(coachId)}/${clientCardId}/timeTracking`;
    export const userPublicInfoDoc = (uid: string) => `${Collections.Users}/${uid}/public/info`;

    export const configDoc = (projectName: string) => `${Collections.Config}/${projectName}`;

    export const promptsLibraryDoc = (coachId: string) => `${Collections.Prompts}/${coachId}`;
    export const clientPromptsDoc = (coachId: string, clientUid: string) => `${promptsLibraryDoc(coachId)}/clientPrompts/${clientUid}`;

    export const userLocalSettings = (uid: string, deviceId?: string) => `${Collections.Users}/${uid}/${Collections.LocalSettings}` + (deviceId ? `/${deviceId}` : '');
}

export default Collections;
