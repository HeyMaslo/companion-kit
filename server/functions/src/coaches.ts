import { FunctionFactory } from 'server/utils/createFunction';
import { Repo } from 'server/services/db';
import { Coaches as CoachesFunctions } from 'common/abstractions/functions';
import { sendEmail, EmailsScheme } from './services/emails';
import { getClientInviteLink } from './services/dynamicLinks';
import {
    ClientCard,
    ClientStatus,
    CoachClientActions,
    ClientInviteMinPeriod,
    UserRoles,
    Invitation, ClientAssessments,
} from 'common/models';
import { ClientsEditAssessment, ClientsRequest } from 'common/models/dtos/clients';
import { prepareEmail } from 'common/utils/emails';
import { Validators, Wrappers, validateObject, ValidationErrors, ValidatorFunction } from 'common/utils/validation';
import { getMaxClients } from 'common/helpers/billing';
import { transferDefinedFields } from 'common/utils/fields';
import { NotificationTypes } from 'common/models/Notifications';
import AppHttpError from 'server/utils/AppHttpError';
import { pushNotifications } from 'server/services/notifications';
import { FeatureSettings as Features } from 'server/services/config';
import { PromptsEndpoint } from './coaches.prompts';
import { DocumentsEndpoint } from './coaches.documents';
import { SessionsEndpoint } from './coaches.sessions';
import { TimeTrackingEndpoint } from './coaches.timeTracking';
import * as ClientFeatures from 'common/constants/features';
import logger from 'common/logger';

export type ClientValidatedObject = {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    goal: string;
    description: string;
    occupation?: string;
    birthday?: number;
    caretakerFirstName?: string;
    caretakerLastName?: string;
    caretakerEmail?: string;
    caretakerRelationship?: string;
};

async function checkExistingActiveClient(email: string, coachId: string) {
    const existingClients = await Repo.ClientCards.getClientsByEmail(email);

    const existingNonArchived = existingClients
        .filter(c => c.status !== ClientStatus.Archived);

    if (existingNonArchived.length > 0) {
        const hint = existingNonArchived.some(c => c.coachId === coachId)
            ? 'Archive their existing card to create a new one.'
            : '';
        throw AppHttpError.AlredyExists(`Client with email '${email}' already exists. ${hint}`);
    }
}

function generateSignInKey(): string { return Math.random().toString(36).substring(2); }

export async function AddClient(data: Partial<ClientCard>, coachId: string, skipEmail = false) {
    if (data) {
        data.email = data.email && prepareEmail(data.email);
        if (ClientFeatures.ClientCardFeatures.CaretakersEnabled) {
            if (data.caretaker) {
                data.caretaker.email = data.caretaker.email && prepareEmail(data.caretaker.email);
            }

            if (data.extraCaretaker) {
                data.extraCaretaker.email = data.extraCaretaker.email && prepareEmail(data.extraCaretaker.email);
            }
        }
    }

    const validatedObject: ClientValidatedObject = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        goal: data.goal,
        description: data.description,
    };

    const validators: { [P in keyof ClientValidatedObject]?: ValidatorFunction<ClientValidatedObject[P]> } = {
        email: Wrappers.required(Validators.email),
        firstName: Validators.notEmpty,
        // lastName: Validators.notEmpty,
    };

    if (ClientFeatures.ClientCardFeatures.CaretakersEnabled) {
        validatedObject.caretakerFirstName = data.caretaker?.firstName;
        validatedObject.caretakerLastName = data.caretaker?.lastName;
        validatedObject.caretakerEmail = data.caretaker?.email;
        validatedObject.caretakerRelationship = data.caretaker?.relationship;

        // validators.birthday = Validators.notEmpty;
        // validators.caretakerFirstName = Validators.notEmpty;
        // validators.caretakerLastName = Validators.notEmpty;
        // validators.caretakerEmail = Wrappers.required(Validators.email);
        // validators.caretakerRelationship = Validators.notEmpty;
    } else if (ClientFeatures.ClientCardFeatures.UseOccupation) {
        validatedObject.occupation = data.occupation;

        validators.occupation = Validators.notEmpty;
    }

    const validationResults = validateObject(validatedObject, validators);

    const invalidArgs = Object.keys(validationResults)
        .map(vrk => (<AppHttpError.InvalidArgDescription>{ name: vrk, error: ValidationErrors.Helper.valueToString(validationResults[vrk]) }));

    if (invalidArgs.length > 0) {
        throw AppHttpError.InvalidArguments(...invalidArgs);
    }

    data.status = ClientStatus.Invited;
    data.date = Date.now();
    data.inviteSentTime = Date.now();

    await checkExistingActiveClient(data.email, coachId);

    const existingInvite = await Repo.Invites.getInvite(data.email);
    if (Invitation.isClient(existingInvite) && Invitation.isValid(existingInvite)) {
        throw AppHttpError.AlredyExists(`Valid Client Invitation for '${data.email}' exists already`);
    }

    const coachUser = await Repo.Users.getUserById(coachId);

    const clients = await Repo.ClientCards.getClients(coachId);
    if (!Features.BillingDisabled ) {
        const activeClients = clients.filter(c => c.status === ClientStatus.Active || c.status === ClientStatus.Invited);
        const allowedClients = getMaxClients(coachUser);

        if (allowedClients !== 'unlimited' && activeClients.length >= allowedClients) {
            throw AppHttpError.PreconditionFailed('You have reached the limit of clients. Please, upgrade your account.');
        }
    }

    // TODO Add more validations regarding existing clients

    const result = await Repo.ClientCards.create(coachId, data);
    const signInKey = generateSignInKey();

    // create invite
    await Repo.Invites.createInvite({
        email: data.email,
        role: UserRoles.Client,
        name: { first: data.firstName, last: data.lastName },
        coachId: coachId,
        clientCardId: result.id,
        date: data.inviteSentTime,
        status: 'created',
        signInKey: signInKey,
    });

    if (!skipEmail) {
        await sendEmail({
            to: data.email,
            data: {
                subject: EmailsScheme.EmailSubjects.Invitation,
                templateInviteClient: {
                    client: { firstName: data.firstName, lastName: data.lastName },
                    coach: { firstName: coachUser.firstName, lastName: coachUser.lastName },
                    ctaLink: getClientInviteLink({ e: data.email, k: signInKey }),
                },
            },
            actionName: 'invite client',
        });
    }

    return result;
}

async function EditAssessments(data: ClientsEditAssessment, clientUid: string, accountId: string) {
    const account = await Repo.Clients.getAccount(clientUid, accountId);
    if (!account) {
        throw AppHttpError.InvalidArguments({ name: nameof(accountId), error: `account was not found for ${clientUid} ${accountId}` });
    }

    const isActive = data.active;

    const assessments = account.assessments ? account.assessments : {};

    if (!assessments[data.type]) {
        assessments[data.type] = {
            active: isActive,
            lastPush: null,
            lastSent: Date.now(),
        };
    } else {
        assessments[data.type] = {
            active: isActive,
            lastPush: isActive ? 0 : ClientAssessments.getDateProperty(assessments, data.type, 'lastPush'),
            lastSent: isActive ? Date.now() : ClientAssessments.getDateProperty(assessments, data.type, 'lastSent'),
        };
    }

    const newAccount =  await Repo.Clients.updateAccount(clientUid, accountId, { assessments });

    if (isActive) {
        const [resp] = await pushNotifications([{
            uid: clientUid,
            data: {
                body: 'Your therapist wants you to take an assessment. It\'s waiting for you in the app.',
                data: {
                    type: NotificationTypes.Assessment,
                    assessmentType: data.type,
                },
            },
        }]);

        if (!resp.statuses.some(s => s.current === 'enqueued' || s.current === 'confirmed')) {
            return { status: false, message: 'Push notification has not been sent!', account: newAccount };
        }
    }

    return { status: true, message: `Assessment has been successfully ${ isActive ? 'activated' : 'deactivated' }`, account: newAccount };
}

export const ClientAction = new FunctionFactory(CoachesFunctions.ClientAction)
    .create(async (data, ctx) => {
        const coachId = ctx.auth.uid;
        const [user, clients] = await Promise.all([
            Repo.Users.getUserById(coachId),
            Repo.ClientCards.getClients(coachId),
        ]);

        // console.log('ClientAction coach uid =', coachId, '; user:', user);
        if (!UserRoles.Helper.contains(user.roles, UserRoles.Coach)) {
            throw AppHttpError.PreconditionFailed('This action is available only for coaches');
        }

        const card = data.clientCardId && clients?.find(c => c.id === data.clientCardId);
        if (!card && data.action !== CoachClientActions.Add) {
            throw AppHttpError.InvalidArguments({ name: 'clientCardId', error: 'Client card was not found' });
        }

        const checkCardStatus = (...statuses: ClientStatus[]) => {
            if (!statuses.includes(card.status)) {
                const str = statuses.map(s => `'${s}'`).join(', ');
                throw AppHttpError.PreconditionFailed(
                    `Invalid client card state '${card.status}' for action '${data.action}', required one of: ${str}`);
            }
        };

        const checkCardId = () => {
            if (!card.clientId) {
                throw AppHttpError.PreconditionFailed('Client card was not associated with client profile');
            }
        };

        const checkMaxCount = () => {
            if (Features.BillingDisabled) {
                return;
            }

            const activeClients = clients.filter(c => c.status === ClientStatus.Active || c.status === ClientStatus.Invited);
            const allowedClients = getMaxClients(user);

            if (allowedClients !== 'unlimited' && activeClients.length >= allowedClients) {
                throw AppHttpError.PreconditionFailed('You have reached the limit of clients. Please, upgrade the plan.');
            }
        };

        const diff: Partial<ClientCard> = { };
        const now = new Date().getTime();
        let needSendInvite = false;

        switch (data.action) {
            case CoachClientActions.Add: {
                const newClient = await AddClient(data.data, coachId, true);
                return newClient;
            }

            case CoachClientActions.Edit: {
                // checkCardId();
                checkCardStatus(ClientStatus.Invited, ClientStatus.Active);

                transferDefinedFields(data.data || {}, diff,
                    'firstName', 'lastName', 'nickname', 'phone', 'occupation', 'birthday', 'goal', 'description', 'caretaker', 'extraCaretaker', 'externalPatientId', 'diagnosis',
                );

                if (card.status === ClientStatus.Invited) {
                    const newEmail = prepareEmail(data.data?.email);
                    if (newEmail && newEmail !== card.email) {
                        // existing client valiation
                        await checkExistingActiveClient(newEmail, coachId);

                        diff.email = newEmail;
                        needSendInvite = await Repo.Invites.updateEmail(card.email, newEmail);
                    }
                }

                break;
            }

            case CoachClientActions.EditAssessments: {
                if (ClientsRequest.isEditAssessment(data)) {
                    const smth = await EditAssessments(data.assessment, card.clientId, card.id);
                    return smth;
                }

                return null;
            }

            case CoachClientActions.ResendInvite: {
                checkCardStatus(ClientStatus.Invited);

                if (now - card.inviteSentTime < ClientInviteMinPeriod) {
                    throw AppHttpError.PreconditionFailed('Client invite is on cooldown');
                }

                needSendInvite = true;

                // renew sign in key
                await Repo.Invites.udpate(card.email, { signInKey: generateSignInKey() });

                diff.inviteSentTime = new Date().getTime();
                break;
            }

            case CoachClientActions.Renew: {
                checkCardStatus(ClientStatus.Inactive);
                checkCardId();
                checkMaxCount();

                // update status inside account
                await Repo.Clients.updateAccount(card.clientId, card.id, { status: ClientStatus.Active, date: now });

                // update status inside client card
                diff.status = ClientStatus.Active;
                break;
            }

            case CoachClientActions.Disable: {
                checkCardStatus(ClientStatus.Active);
                checkCardId();

                await Repo.Clients.updateAccount(card.clientId, card.id, { status: ClientStatus.Inactive, date: now });

                diff.status = ClientStatus.Inactive;
                break;
            }

            case CoachClientActions.Archive: {
                checkCardStatus(ClientStatus.Invited, ClientStatus.Inactive);

                if (card.status === ClientStatus.Invited) {
                    // delete invitation
                    await Repo.Invites.udpate(card.email, { status: 'expired', signInKey: null });
                    // delete card
                    await Repo.ClientCards.delete(coachId, card.id);

                    return card;
                }

                // archive account
                checkCardId();

                await Repo.Clients.updateAccount(card.clientId, card.id, { status: ClientStatus.Archived, date: now });

                diff.status = ClientStatus.Archived;
                break;
            }

            default: {
                throw AppHttpError.InvalidArguments({ name: 'action', error: 'Unsupported action',
                    got: data.action,
                    expected: CoachClientActions.Helper.Values.join(', ') });
            }
        }

        const result = await Repo.ClientCards.update(coachId, data.clientCardId, diff);

        if (needSendInvite) {
            // TODO parse result and notify user is email looks bad
            // const validationResult = await validateEmailAddress(result.email);
            // console.log(' ==================== validateEmailAddress', validationResult);

            const currentInvite = await Repo.Invites.getInvite(result.email);

            await sendEmail({
                to: result.email,
                data: {
                    subject: EmailsScheme.EmailSubjects.Invitation,
                    templateInviteClient: {
                        client: { firstName: result.firstName, lastName: result.lastName },
                        coach: { firstName: user.firstName, lastName: user.lastName },
                        ctaLink: getClientInviteLink({ e: result.email, k: currentInvite?.signInKey || 'invalid' }),
                    },
                },
                actionName: 're-send invitation',
            });
        }

        return result;
    });

export const Functions = {
};

if (ClientAction) {
    Functions[ClientAction.Definition.Name] = ClientAction.AuthFunction;
}

if (DocumentsEndpoint) {
    Functions[DocumentsEndpoint.Definition.Name] = DocumentsEndpoint.AuthFunction;
}

if (PromptsEndpoint) {
    Functions[PromptsEndpoint.Definition.Name] = PromptsEndpoint.AuthFunction;
}

if (SessionsEndpoint) {
    Functions[SessionsEndpoint.Definition.Name] = SessionsEndpoint.AuthFunction;
}

if (TimeTrackingEndpoint) {
    Functions[TimeTrackingEndpoint.Definition.Name] = TimeTrackingEndpoint.AuthFunction;
}
