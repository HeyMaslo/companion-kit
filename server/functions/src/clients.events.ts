import { FunctionFactory } from 'server/utils/createFunction';
import { Repo } from 'server/services/db';
import { Clients as ClientsFunctions } from 'common/abstractions/functions';
import AppHttpError from './utils/AppHttpError';
import * as EventsDtos from 'common/models/dtos/events';
import { FeatureSettings } from './services/config';
import { AnyEvent, EventIded } from 'common/models/Events';
import logger from 'common/logger';

function validateEventContent(e: AnyEvent, namePrefix: string, errs: AppHttpError.InvalidArgDescription[], validateIds = false): boolean {
    let valid = true;

    if (validateIds) {
        if (!e.coachUid) {
            errs.push({ name: `${namePrefix}.coachUid`, expected: 'not_null' });
            valid = false;
        }
        if (!e.clientUid) {
            errs.push({ name: `${namePrefix}.clientUid`, expected: 'not_null' });
            valid = false;
        }
        if (!e.clientCardId) {
            errs.push({ name: `${namePrefix}.clientCardId`, expected: 'not_null' });
            valid = false;
        }
    }

    if (!e.text) {
        errs.push({ name: `${namePrefix}.text`, expected: 'not_empty' });
        valid = false;
    }
    if (!e.timestamp) {
        errs.push({ name: `${namePrefix}.timestamp`, expected: 'not_empty' });
        valid = false;
    }

    if (AnyEvent.isPrompt(e)) {
        if (!e.promptId) {
            errs.push({ name: `${namePrefix}.promptId`, expected: 'not_empty' });
            valid = false;
        }
    } else if (AnyEvent.isAssessment(e)) {
        if (!e.assessmentType) {
            errs.push({ name: `${namePrefix}.assessmentType`, expected: 'not_empty' });
            valid = false;
        }
    } else if (AnyEvent.isTriggerPhrase(e)) {
        if (!e.phrase) {
            errs.push({ name: `${namePrefix}.phrase`, expected: 'not_empty' });
            valid = false;
        }
    } else {
        errs.push({ name: `${namePrefix}.type`, error: 'not_implemented', got: (e as AnyEvent).type });
        valid = false;
    }

    return valid;
}

export async function addClientEvent(e: AnyEvent) {
    const errs: AppHttpError.InvalidArgDescription[] = [];
    if (!validateEventContent(e, 'add', errs, true)) {
        throw AppHttpError.InvalidArguments(...errs);
    }
    logger.log('Adding client event', e);
    await Repo.Clients.addClientEvent(e);
}

async function updateEvents(data: EventsDtos.EventsRequestDto): Promise<EventIded[]> {
    const { clientId, accountId } = data;
    const errs: AppHttpError.InvalidArgDescription[] = [];

    const account = await Repo.Clients.getAccount(clientId, accountId);
    if (!account) {
        throw AppHttpError.InvalidArguments({ name: 'account', error: 'Account was not found' });
    }

    const promises: (() => Promise<EventIded>)[] = [];

    if (data.add?.length) {
        promises.push(
            ...data.add.map(d => {
                d.coachUid = account.coachId;
                d.clientCardId = accountId;
                d.clientUid = clientId;
                if (validateEventContent(d, 'add', errs, true)) {
                    return () => Repo.Clients.addClientEvent(d);
                }
                return null;
            }),
        );
    }

    if (data.update?.length) {
        promises.push(
            ...data.update.map(d => {
                if (validateEventContent(d, 'update', errs)) {
                    d.clientUid = clientId;
                    d.coachUid = account.coachId;
                    d.clientCardId = accountId;
                    return () => Repo.Clients.updateClientEvent(clientId, accountId, d.id, d);
                }
                return null;
            }),
        );
    }

    if (data.remove?.length) {
        promises.push(
            ...data.remove.map(id => (() => Repo.Clients.removeClientEvent(clientId, accountId, id))),
        );
    }

    if (errs.length > 0) {
        throw AppHttpError.InvalidArguments(...errs);
    }

    const affected = await Promise.all(promises.map(pp => pp()));

    return affected;
}

export const EventsEndpoint = FeatureSettings.EditablePrompts && new FunctionFactory(ClientsFunctions.EventsEndpoint)
    .create(async (data) => {
        const affected = await updateEvents(data);

        return affected;
    });
