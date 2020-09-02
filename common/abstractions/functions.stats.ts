import { UserProfile } from 'common/models';
import {
    ClientJournalEntryIded,
    ClientSessionEntryIded,
} from 'common/models';
import { FunctionDefinition } from './functions.definition';

export namespace Stats {
    export const Namespace = 'stats';

    export enum StatsTypes {
        RawQuery = 'raw',
        PayingCoaches = 'pc',
        FailedRecords = 'fr',
        UpdateEntriesIds = 'ei',
        Analytics = 'an',
        FilesMetadata = 'fm',
    }

    type StatsAccessArgs = {
        type: StatsTypes,
    };

    export namespace StatsTypes {
        export namespace FailedRecords {
            export type Args = StatsAccessArgs & {
                type: StatsTypes.FailedRecords;
                startMs?: number;
                endMs?: number;
                deleteRecords?: boolean,
            };
            export type Result = {
                type: StatsTypes.FailedRecords;
                journals: ClientJournalEntryIded[],
                sessions: ClientSessionEntryIded[],
            };
        }

        export namespace PayingCoaches {
            export type Args = StatsAccessArgs & {
                type: StatsTypes.PayingCoaches;
            };
            export type Result = {
                type: StatsTypes.PayingCoaches;
                freeAccessCoaches: UserProfile[],
                payingCoaches: UserProfile[],
            };
        }

        export namespace UpdateEntriesIds {
            export type Args = StatsAccessArgs & {
                type: StatsTypes.UpdateEntriesIds;
                back?: number;
                periodDays?: number;
            };

            export type Result = {
                type: StatsTypes.UpdateEntriesIds;
                journals: ClientJournalEntryIded[],
                sessions: ClientSessionEntryIded[],
            };
        }

        export namespace RawQuery {
            export type Args = StatsAccessArgs & {
                type: StatsTypes.RawQuery;
                query: string;
            };

            export type Result = {
                type: StatsTypes.RawQuery;
                data: any;
            };
        }

        export namespace Analytics {
            export type Args = StatsAccessArgs & {
                type: StatsTypes.Analytics;
                from?: number;
                to?: number;
            };

            export type ResultItem = { key: string, value: number | string[] };

            export type Result = {
                type: StatsTypes.Analytics;
                results: ResultItem[];
            };
        }

        export namespace FilesMetadata {
            export type Args = StatsAccessArgs & {
                type: StatsTypes.FilesMetadata;
                back?: number;
            };

            export type ResultItem = { updated: boolean, entryId: string };

            export type Result = {
                type: StatsTypes.FilesMetadata;
                sessions: ResultItem[];
            };
        }
    }

    export type StatsRequest  = StatsTypes.FilesMetadata.Args | StatsTypes.FailedRecords.Args | StatsTypes.PayingCoaches.Args | StatsTypes.UpdateEntriesIds.Args | StatsTypes.RawQuery.Args | StatsTypes.Analytics.Args;
    export type StatsResponse = StatsTypes.FilesMetadata.Result | StatsTypes.FailedRecords.Result | StatsTypes.PayingCoaches.Result | StatsTypes.UpdateEntriesIds.Result | StatsTypes.RawQuery.Result | StatsTypes.Analytics.Result;

    export const GetStats = new FunctionDefinition<StatsRequest, StatsResponse>('get', Namespace, 540, '1GB');

    export const GetFailedEntries = GetStats.specify<StatsTypes.FailedRecords.Args, StatsTypes.FailedRecords.Result>();
    export const GetPayingCoaches = GetStats.specify<StatsTypes.PayingCoaches.Args, StatsTypes.PayingCoaches.Result>();
    export const UpdgradeEntriesIds = GetStats.specify<StatsTypes.UpdateEntriesIds.Args, StatsTypes.UpdateEntriesIds.Result>();
    export const GetRawQuery = GetStats.specify<StatsTypes.RawQuery.Args, StatsTypes.RawQuery.Result>();
    export const GetAnalytics = GetStats.specify<StatsTypes.Analytics.Args, StatsTypes.Analytics.Result>();
    export const UpdateFilesMetadata = GetStats.specify<StatsTypes.FilesMetadata.Args, StatsTypes.FilesMetadata.Result>();
}
