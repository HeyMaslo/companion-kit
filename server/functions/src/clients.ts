import { FunctionFactory } from 'server/utils/createFunction';
import { Repo } from 'server/services/db';
import AppHttpError from './utils/AppHttpError';
import { Validators, validateObject, ValidationErrors, Wrappers } from 'common/utils/validation';
import { Clients as ClientFunctions } from 'common/abstractions/functions';
import { ClientAssessments, UserRoles, AssessmentType, ClientAssessmentState, IntakeForms } from 'common/models';
import { PubSub } from 'server/services/pubsub';
import * as JournalDtos from 'common/models/dtos/journals';
import { transferDefinedFields } from 'common/utils/fields';
import { FeatureSettings } from 'server/services/config';
import { EventsEndpoint } from 'server/clients.events';

const JournalLocationRequired = false;

export const UploadJournal = new FunctionFactory(ClientFunctions.JournalEndpoint)
    .create(async (data, ctx) => {
        const user = await Repo.Users.getUserById(ctx.auth.uid);
        if (!UserRoles.Helper.contains(user.roles, UserRoles.Client)) {
            throw AppHttpError.NoPermission('Only client can upload journal entry');
        }

        const account = await Repo.Clients.getAccount(ctx.auth.uid, data.accountId);
        if (!account) {
            throw AppHttpError.InvalidArguments({ name: 'account', error: 'Account was not found' });
        }

        if (JournalDtos.JournalRequest.isEdit(data)) {
            const diff: Partial<typeof data.diff> = { };
            transferDefinedFields(data.diff, diff, 'private');

            const res = await Repo.Clients.updateJournal(ctx.auth.uid, data.accountId, data.entryId, diff);
            return res;
        }

        const validationResults = validateObject(data.entry, {
            location: JournalLocationRequired ? Validators.notEmpty : Validators.none,
            mood: Validators.notEmpty,
            question: Validators.notEmpty,
        });

        Object.assign(validationResults, validateObject(data.entry, {
            transcription: Validators.notEmpty,
            auidioRef: Validators.notEmpty,
            image: Wrappers.getter('storageRef', FeatureSettings.PicturesCheckInsEnabled ? Validators.notEmpty : Validators.none),
        }, true));

        const invalidArgs = Object.keys(validationResults)
            .map(vrk => (<AppHttpError.InvalidArgDescription>{ name: vrk, error: ValidationErrors.Helper.valueToString(validationResults[vrk]) }));

        if (invalidArgs.length > 0) {
            throw AppHttpError.InvalidArguments(...invalidArgs);
        }

        const now = new Date().getTime();
        data.entry.date = now;

        data.entry.clientUid = ctx.auth.uid;
        data.entry.coachUid = account.coachId;
        data.entry.clientCardId = account.id;

        const result = await Repo.Clients.addJournalEntry(ctx.auth.uid, data.accountId, data.entry);

        // update journals history
        const client = await Repo.Clients.getClient(ctx.auth.uid);
        const currentHistory = client.journalsHistory || [];
        currentHistory.push(now);
        await Repo.Clients.ensure(ctx.auth.uid, { journalsHistory: currentHistory });

        await PubSub.Topics.AudioEntryUploaded.publish({
            type: 'journal',
            clientUid: ctx.auth.uid,
            accountId: account.id,
            entryId: result.id,
        });

        return result;
    });

export const IntakeFormsEndpoint = FeatureSettings.IntakeFormsEnabled && new FunctionFactory(ClientFunctions.AddIntakeFormResponse)
    .create(async (data, ctx) => {
        const user = await Repo.Users.getUserById(ctx.auth.uid);
        if (!UserRoles.Helper.contains(user.roles, UserRoles.Client)) {
            throw AppHttpError.NoPermission('Only client can submit an intake form');
        }

        const account = await Repo.Clients.getAccount(ctx.auth.uid, data.accountId);
        if (!account) {
            throw AppHttpError.InvalidArguments({ name: 'account', error: 'Account was not found' });
        }

        const validationResults = validateObject(data.entry, {
            formType: Validators.arrayContains(AssessmentType.EnabledTypes.value),
            answers: Validators.notEmptyArray,
        });

        const invalidArgs = Object.keys(validationResults)
            .map(vrk => (<AppHttpError.InvalidArgDescription>{ name: vrk, error: ValidationErrors.Helper.valueToString(validationResults[vrk]) }));

        if (invalidArgs.length > 0) {
            console.log('Enabld form tyes:', AssessmentType.EnabledTypes.value, '; got formType:', data.entry.formType);
            throw AppHttpError.InvalidArguments(...invalidArgs);
        }

        const now = Date.now();

        const active = ClientAssessments.getIsCooledDown(account.assessments, data.entry.formType, now);
        if (!active && !IntakeForms[data.entry.formType].AllowClientRetake) {
            const formState = account.assessments[data.entry.formType];
            const debugState = {
                ...(formState === true ? { active: true, lastPush: null } : formState),
                period: IntakeForms[data.entry.formType].RecurrencyTimeMs,
            };

            throw AppHttpError.PreconditionFailed(
                `${data.entry.formType} assessment form is not active at the moment, state = ${JSON.stringify(debugState)}`,
            );
        }

        data.entry.date = now;
        data.entry.clientUid = ctx.auth.uid;
        data.entry.coachUid = account.coachId;
        data.entry.clientCardId = account.id;

        const newEntry = await Repo.Clients.addIntakeFormResponse(ctx.auth.uid, data.accountId, data.entry);

        const result = await Repo.Clients.updateAccount(ctx.auth.uid, account.id, {
            assessments: {
                ...account.assessments,
                [data.entry.formType]: {
                    active,
                    lastPush: data.entry.date,
                },
            }});

        return { account: result, entry: newEntry};
    });

export const Functions = {
    [UploadJournal.Definition.Name]: UploadJournal.AuthFunction,
};

if (IntakeFormsEndpoint) {
    Functions[IntakeFormsEndpoint.Definition.Name] = IntakeFormsEndpoint.AuthFunction;
}

if (EventsEndpoint) {
    Functions[EventsEndpoint.Definition.Name] = EventsEndpoint.AuthFunction;
}
