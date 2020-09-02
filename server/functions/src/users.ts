import { FunctionFactory } from 'server/utils/createFunction';
import {
    ClientCardIded,
    ClientInvitation,
    ClientStatus,
    Invitation,
    UserRoles,
    UserProfile,
    ICoachSignUpData,
} from 'common/models';
import { Users as UsersFunctions } from 'common/abstractions/functions';
import { Repo } from 'server/services/db';
import admin, { AdminLib } from 'server/services/admin';
import { AdminEmail, EmailsScheme, sendEmail } from 'server/services/emails';

import FullUser from 'common/models/FullUser';
import { prepareEmail } from 'common/utils/emails';
import { formatFullDate } from 'common/utils/dateHelpers';
import AppHttpError from './utils/AppHttpError';
import { Organizations } from 'common/models/organizations';
import * as ClientFeatures from 'common/constants/features';

import { AuthEndpoint } from './auth';
import { UpdateUser } from './users.update';

import { FeatureSettings, MobileStandaloneCoachEmail, PreActivatedAssessments } from './services/config';
import { getFirebaseConsoleUserLink } from 'server/services/dynamicLinks';
import NamesHelper from 'common/utils/nameHelper';
import { ensureAuthUser } from './services/generateToken';
import { AddClient } from './coaches';
import { PhoneValidator } from 'common/utils/validation/phoneNumber';
import { ValidationErrors } from 'common/utils/validation';

type NameInfo = { first: string, last: string, display: string };

type ProfielSignupData = {
    name: NameInfo,
    profile?: Partial<Pick<UserProfile, 'phone'>>,
};

async function ensureUserProfile(authUser: AdminLib.auth.UserRecord, role: UserRoles, data: ProfielSignupData ) {
    let existing = await Repo.Users.getUserById(authUser.uid);
    const { name, profile } = data;

    if (!existing) {
        existing = await Repo.Users.ensureAndUpdate(authUser.uid, {
            email: authUser.email,
            firstName: name.first,
            lastName: name.last,
            roles: role,
            photoURL: authUser.photoURL || null,
            displayName: name.display || null,

            ...profile,

            freeAccess: !!FeatureSettings.FreeAccessForNewUsers || null,
        });
    } else {
        const roles = UserRoles.Helper.combine(existing.roles || UserRoles.Undefined, role);
        existing = await Repo.Users.ensureAndUpdate(authUser.uid, {
            roles: roles,
            photoURL: existing.photoURL || authUser.photoURL || null,
            firstName: name.first || '',
            lastName: name.last || '',
            displayName: name.display || null,

            ...profile,

            freeAccess: existing.freeAccess || !!FeatureSettings.FreeAccessForNewUsers || null,
        });
    }

    // update public info
    await Repo.Users.updatePublicProfile(authUser.uid, {
        displayName: existing.displayName || null,
        photoURL: existing.photoURL || null,
    });

    return existing;
}

export const CreateUser = new FunctionFactory(UsersFunctions.CreateUser)
    .create(async (data, ctx) => {
        const authUser = await admin.auth().getUser(ctx.auth.uid);
        const email = authUser && prepareEmail(authUser.email);

        if (!email) {
            throw AppHttpError.InvalidArguments({ name: 'email', error: 'Invalid email address' });
        }

        const signUpData: ProfielSignupData = {
            name: null,
            profile: null,
        };
        let clientInvitation: ClientInvitation;
        let clientCard: ClientCardIded;

        if (data.role === UserRoles.Coach) {
            if (ClientFeatures.Dashboard.CoachVerificationRequired && !Organizations.includes(data.organization)) {
                throw AppHttpError.InvalidArguments({ name: nameof<ICoachSignUpData>(d => d.organization), error: 'Valid organization field is required for registration' });
            }

            if (ClientFeatures.Dashboard.UseMobileNumber) {
                if (!data.phoneNumber) {
                    throw AppHttpError.InvalidArguments({ name: nameof<ICoachSignUpData>(d => d.phoneNumber), error: 'Valid phone number field is required for registration' });
                }

                const ve = PhoneValidator.Validate(data.phoneNumber, ClientFeatures.Dashboard.UseMobileNumber.countries);
                if (ve !== ValidationErrors.None) {
                    throw AppHttpError.InvalidArguments({
                        name: nameof<ICoachSignUpData>(d => d.phoneNumber),
                        error: 'Unsupported phone number format',
                    });
                }
            }

            signUpData.name = {
                first: data.firstName,
                last: data.lastName,
                display: data.displayName || `${data.firstName} ${data.lastName}`,
            };

            signUpData.profile = {
                phone: data.phoneNumber,
            };
        } else if (data.role === UserRoles.Client) {
            if (FeatureSettings.MobileStandalone) {
                if (authUser.email === MobileStandaloneCoachEmail) {
                    throw new Error('not sure why but please don\'t do this');
                }

                // const existingUser = await Repo.Users.getUserById(authUser.uid);
                // if (existingUser && UserRoles.Helper.contains(existingUser.roles, UserRoles.Client)) {
                //     return { message: 'user exists already' };
                // }

                await createStandaloneUserInfrastructure(authUser);
            }

            const invite = await Repo.Invites.getInvite(email);

            if (Invitation.isClient(invite)) {
                await tryToSetClientPromptsCollection(invite.coachId, ctx.auth.uid);
            }

            if (!invite || !Invitation.isValid(invite) || !Invitation.isClient(invite)) {
                return { message: 'No valid invitation has been found' };
            }

            clientInvitation = invite;

            // get client card as profile info
            clientCard = await Repo.ClientCards.getClient(invite.coachId, invite.clientCardId);
            if (!clientCard) {
                // card could be deleted, delete this invite
                await Repo.Invites.udpate(email, { status: 'expired' });
                return { message: 'Your invitation has expired.' };
            }

            signUpData.name = {
                first: clientCard.firstName,
                last: clientCard.lastName,
                display: authUser.displayName || `${clientCard.firstName} ${clientCard.lastName}`,
            };
        } else {
            throw AppHttpError.InvalidArguments({ name: 'role', error: 'invalid role' });
        }

        const user = await ensureUserProfile(authUser, data.role, signUpData) as FullUser;

        if (data.role === UserRoles.Coach) {
            const coach = await Repo.Coaches.ensureAndUpdate(ctx.auth.uid, {
                onboarded: false,
                organization: data.organization || null,
            });

            user.coach = coach;

            if (ClientFeatures.Dashboard.CoachVerificationRequired) {
                const mailData: EmailsScheme.AdminApprove = {
                    subject: EmailsScheme.EmailSubjects.AdminApprove,
                    templateAdminApprove: {
                        ctaLink: getFirebaseConsoleUserLink(user.id),
                        coach: {
                            firstName: data.firstName,
                            lastName: data.lastName,
                            email: data.email,
                        },
                        organization: data.organization,
                        date: formatFullDate(Date.now(), true),
                    },
                };

                await sendEmail({
                    to: [
                        AdminEmail,
                    ],
                    data: mailData,
                    actionName: `coach sign up`,
                });
            }

            return user;
        } else {
            // ensure client profile
            let profile = await Repo.Clients.getClient(ctx.auth.uid);
            if (!profile) {
                profile = await Repo.Clients.ensure(ctx.auth.uid, {
                    onboarded: false,
                });
            }

            user.client = profile;

            const coach = await Repo.Users.getUserById(clientInvitation.coachId);
            const now = Date.now();
            // Create account
            const accountData = {
                assessments: {},
                coachId: clientInvitation.coachId,
                status: ClientStatus.Active,
                date: now,
                coachName: coach.displayName || `${coach.firstName} ${coach.lastName}`,
            };

            if (PreActivatedAssessments) {
                PreActivatedAssessments.forEach(assessment => {
                    accountData.assessments[assessment] = {
                        active: true,
                        lastPush: null,
                        lastSent: now,
                    };
                });
            }

            const account = await Repo.Clients.createAccount(ctx.auth.uid, clientCard.id, accountData);

            // Update client card
            await Repo.ClientCards.update(clientInvitation.coachId, clientInvitation.clientCardId, {
                status: ClientStatus.Active,
                clientId: profile.id,
            });

            // if we get here, invitation has been used
            await Repo.Invites.udpate(email, { signInKey: null, status: 'used', usedByUserId: ctx.auth.uid });

            return {
                createdAccount: account,
                message: 'Account has been created successfully, invitation has been deleted.',
            };
        }
    });

async function tryToSetClientPromptsCollection(coachId: string, clientUid: string) {
    if (!FeatureSettings.EditablePrompts) {
        return;
    }

    const library = await Repo.Coaches.getPromptsLibrary(coachId);
    if (library) {
        const existing = await Repo.Coaches.getClientPrompts(library.id, clientUid);
        if (!existing) {
            const defaultPrompts = library.types
                .filter(prompt => prompt.default);

            await Repo.Coaches.updateClientPrompts(
                library.id,
                clientUid,
                {
                    prompts: defaultPrompts.map(p => ({ promptId: p.id, active: true })),
                    tipsData: [],
                });
        }
    }
}

async function createStandaloneUserInfrastructure(clientAuthUser: AdminLib.auth.UserRecord) {
    const clientCards = await Repo.ClientCards.getClientsByEmail(
        clientAuthUser.email,
        null,
        ClientStatus.Active, ClientStatus.Inactive, ClientStatus.Invited,
    );

    // if there's existing client card which OK for us
    if (clientCards.length) {
        return;
    }

    // ensure Standalone Coach
    let coachUser = await Repo.Users.getUserByEmail(MobileStandaloneCoachEmail);
    if (!coachUser) {
        const coachAuthUser = await ensureAuthUser(MobileStandaloneCoachEmail, true);
        coachUser = await ensureUserProfile(coachAuthUser, UserRoles.Coach, {
            name: {
                display: 'Maslo',
                first: 'Maslo',
                last: '',
            },
        });

        await Repo.Coaches.ensureAndUpdate(coachAuthUser.uid, {
            onboarded: true,
            organization: null,
        });
    }

    const nameSplit = NamesHelper.split(clientAuthUser);

    await AddClient({
        email: clientAuthUser.email,
        firstName: nameSplit.firstName || 'User',
        lastName: nameSplit.lastName || '',
    }, coachUser.id, true);
}

export const Functions = {
    [AuthEndpoint.Definition.Name]: AuthEndpoint.Function,
    [CreateUser.Definition.Name]: CreateUser.AuthFunction,
    [UpdateUser.Definition.Name]: UpdateUser.AuthFunction,
};
