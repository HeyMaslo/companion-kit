import { FunctionFactory } from 'server/utils/createFunction';
import { Repo } from 'server/services/db';
import { Coaches as CoachesFunctions } from 'common/abstractions/functions';
import { transferDefinedFields } from 'common/utils/fields';
import { FeatureSettings } from './services/config';
import { TimeTrackingEntry } from 'common/models/TimeTracking';

export const TimeTrackingEndpoint = FeatureSettings.TimeTrackingEnabled && new FunctionFactory(CoachesFunctions.TimeTrackingEndpoint)
    .create(async (data, ctx) => {
        const coachId = ctx.auth.uid;
        const clientCardId = data.clientCardId;

        if (data.timeTracking.id && data.remove) {
            const resultRemove = await Repo.ClientCards.deleteTimeTracking(coachId, clientCardId, data.timeTracking.id);

            return resultRemove;
        }

        if (data.timeTracking.id) {
            const diff: Partial<TimeTrackingEntry> = { };
            transferDefinedFields(data.timeTracking, diff, 'date', 'activity', 'notes', 'minutes', 'billable');
            const resultUpdate = await Repo.ClientCards.updateTimeTracking(coachId, clientCardId, data.timeTracking.id, diff);

            return resultUpdate;
        }

        const timeTracking = data.timeTracking as TimeTrackingEntry;
        timeTracking.timestamp = new Date().getTime();

        const clientCard = await Repo.ClientCards.getClient(coachId, clientCardId);
        const clientUid = clientCard.clientId;

        timeTracking.clientUid = clientUid;
        timeTracking.coachUid = ctx.auth.uid;
        timeTracking.clientCardId = clientCard.id;

        console.log('[TimeTracking] Creating time tracking:', timeTracking);

        const res = await Repo.ClientCards.createTimeTracking(coachId, clientCardId, timeTracking);

        return res;
    });
