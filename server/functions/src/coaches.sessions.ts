import { FunctionFactory } from 'server/utils/createFunction';
import { Repo } from 'server/services/db';
import { Coaches as CoachesFunctions } from 'common/abstractions/functions';
import * as SessionsDtos from 'common/models/dtos/sessions';
import { PubSub } from 'server/services/pubsub';
import { transferDefinedFields } from 'common/utils/fields';
import { FeatureSettings as Features } from 'server/services/config';
import { ClientSessionEntry } from 'common/models';

export const SessionsEndpoint = !Features.SessionsDisabled && new FunctionFactory(CoachesFunctions.SessionsEndpoint)
    .create(async (data, ctx) => {

        const coachId = ctx.auth.uid;
        const clientCardId = data.clientCardId;

        if (SessionsDtos.SessionsRequest.isEdit(data)) {
            const diff: Partial<ClientSessionEntry> = { };
            transferDefinedFields(data.diff, diff, 'name', 'date');

            try {
                const entry = await Repo.ClientCards.updateSession(coachId, data.clientCardId, data.sessionId, diff);
                return { ok: true, entry };
            } catch (err) {
                return { ok: false, error: err };
            }
        }

        const session = data.session;
        session.date = new Date().getTime();

        const clientCard = await Repo.ClientCards.getClient(coachId, clientCardId);
        const clientUid = clientCard.clientId;

        session.clientUid = clientUid;
        session.coachUid = ctx.auth.uid;
        session.clientCardId = clientCard.id;

        console.log('[SessionsEndpoint] Creating session:', session);

        const res = await Repo.ClientCards.createSession(coachId, clientCardId, session);

        // await ProcessAudioEntry.Worker({
        //     type: 'session',
        //     clientUid: clientUid,
        //     accountId: clientCardId,
        //     entryId: res.id,
        //     createRecord: true,
        // }, ctx);

        await PubSub.Topics.AudioEntryUploaded.publish({
            type: 'session',
            clientUid: clientUid,
            accountId: clientCardId,
            entryId: res.id,
        });

        return res;
    });
