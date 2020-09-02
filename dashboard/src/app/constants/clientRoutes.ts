import EnumHelper from 'common/utils/enumHelper';

const ClientIdParam = ':clientId';
const TabParam = ':tab';
const JournalIdParam = ':journalId';
const SessionIdParam = ':sessionId';
const AssessmentTypeParam = ':type';
const DocsIdParam = ':docsId';
const IntakeFormIdParam = ':id';

function Template(clientId: string, tabName: string, isDefault = false) {
    const tabPath = isDefault ? `(${tabName})?` : tabName;
    return `/client/${clientId}/${tabPath}`;
}

export const TabTemplate = (tab: ClientDetails.Tabs, isDefault = false) => {
    const tabName = ClientDetails.Tabs[tab];
    return Template(ClientIdParam, tabName, isDefault);
};

export function ClientDetails(clientId: string, tab: ClientDetails.Tabs) {
    const tabName = ClientDetails.Tabs[tab];
    return Template(clientId, tabName);
}

export namespace ClientDetails {
    export enum Tabs {
        overview = 0,
        journal = 1,
        sessions = 2,
        edit = 3,
        view = 4,
        assessments = 5,
        docs = 6,
        prompts = 7,
        interventions = 8,
        timetracking = 9,
        goals = 10,
        report = 11,
    }

    export namespace Tabs {
        export const Helper = new EnumHelper<Tabs>(Tabs);

        export function fromKey(key: string) {
            return Helper.keyToValue(key);
        }
    }

    export const GeneralTab = Template(ClientIdParam, TabParam);
    export const Overview = TabTemplate(Tabs.overview, true);
    export const Journal = TabTemplate(Tabs.journal);
    export const Sessions = TabTemplate(Tabs.sessions);
    export const Edit = TabTemplate(Tabs.edit);
    export const View = TabTemplate(Tabs.view);
    export const Assessments = TabTemplate(Tabs.assessments);
    export const Docs = TabTemplate(Tabs.docs);
    export const Prompts = TabTemplate(Tabs.prompts);
    export const Interventions = TabTemplate(Tabs.interventions);
    export const Timetracking = TabTemplate(Tabs.timetracking);
    export const Goals = TabTemplate(Tabs.goals);
    export const Report = TabTemplate(Tabs.report);

    export function JournalInner(clientId: string, journalId: string) {
        return `${ClientDetails(clientId, Tabs.journal)}/${journalId}`;
    }

    export function SessionInner(clientId: string, sessionId: string) {
        return `${ClientDetails(clientId, Tabs.sessions)}/${sessionId}`;
    }

    export function AssessmentInner(clientId: string, type: string) {
        return `${ClientDetails(clientId, Tabs.assessments)}/${type}`;
    }

    export function IntakeFormInner(clientId: string, type: string, id: string) {
        return `${ClientDetails(clientId, Tabs.assessments)}/${type}/${id}`;
    }

    export function DocsImagesInner(clientId: string) {
        return `${ClientDetails(clientId, Tabs.docs)}/images`;
    }

    export namespace JournalInner {
        export const Template = JournalInner(ClientIdParam, JournalIdParam);
    }

    export namespace SessionInner {
        export const Template = SessionInner(ClientIdParam, SessionIdParam);
    }

    export namespace AssessmentInner {
        export const Template = AssessmentInner(ClientIdParam, AssessmentTypeParam);
    }

    export namespace IntakeFormInner {
        export const Template = IntakeFormInner(ClientIdParam, AssessmentTypeParam, IntakeFormIdParam);
    }

    export namespace DocsImagesInner {
        export const Template = DocsImagesInner(ClientIdParam);
    }

    export function JournalTranscription(clientId: string, journalId: string) {
        return `${JournalInner(clientId, journalId)}/transcription`;
    }

    export namespace JournalTranscription {
        export const Template = JournalTranscription(ClientIdParam, JournalIdParam);
    }

    export function SessionTranscription(clientId: string, sessionId: string) {
        return `${SessionInner(clientId, sessionId)}/transcription`;
    }

    export namespace SessionTranscription {
        export const Template = SessionTranscription(ClientIdParam, SessionIdParam);
    }

}
