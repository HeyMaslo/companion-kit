import { Repo } from 'server/services/db';
import { Stats as StatsFunctions } from 'common/abstractions/functions';
import { getPayingCoaches } from './stats/payingCoaches';
import { getMissedRecords } from './stats/failedRecords';
import { updateEntriesIds } from './stats/updateEntriesIds';
import { doRawSqlQuery } from './stats/rawSqlQuery';
import { getAnalytics } from './stats/analytics';
import { updateFilesMetadata } from './stats/updateFilesMetadata';
import { FunctionFactory } from './utils/createFunction';
import AppHttpError from './utils/AppHttpError';

import StatsTypes = StatsFunctions.StatsTypes;

async function checkPass(uid: string) {
    const user = uid && await Repo.Users.getUserById(uid);
    return user && !!user.isAdmin;
}

const GetStats = new FunctionFactory(StatsFunctions.GetStats)
    .create(async (data, ctx) => {
        const isPassCorrect = await checkPass(ctx.auth.uid);
        if (!isPassCorrect) {
            throw AppHttpError.NoPermission();
        }

        switch (data.type) {
            case StatsTypes.FailedRecords: {
                const result = await getMissedRecords(data.startMs, data.endMs, data.deleteRecords);
                return {
                    ...result,
                    type: data.type,
                };
            }

            case StatsTypes.PayingCoaches: {
                const result = await getPayingCoaches();
                return {
                    ...result,
                    type: data.type,
                };
            }

            case StatsTypes.UpdateEntriesIds: {
                const result = await updateEntriesIds(data.back, data.periodDays);
                return {
                    ...result,
                    type: data.type,
                };
            }

            case StatsTypes.RawQuery: {
                return {
                    data: await doRawSqlQuery(data.query),
                    type: data.type,
                };
            }

            case StatsTypes.Analytics: {
                return {
                    type: data.type,
                    results: await getAnalytics(data.from, data.to),
                };
            }

            case StatsTypes.FilesMetadata: {
                const results = await updateFilesMetadata();
                return {
                    ...results,
                    type: data.type,
                };
            }

            default: {
                throw AppHttpError.InvalidArguments({ name: 'type' });
            }
        }
    });

export const StatsCallFunctions = {
    [StatsFunctions.GetStats.Name]: GetStats.AuthFunction,
};
