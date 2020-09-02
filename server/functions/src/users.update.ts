import { FunctionFactory } from 'server/utils/createFunction';
import { UserRoles, UserProfile, ClientStatus, CoachProfile } from 'common/models';
import { Users as UsersFunctions } from 'common/abstractions/functions';
import { Repo } from 'server/services/db';
import { sendEmail, EmailsScheme } from 'server/services/emails';
import * as UpdateUserDtos from 'common/models/dtos/updateUser';

import { transferTruthyFields, transferDefinedFields, transferNotNullFields } from 'common/utils/fields';
import AppHttpError from './utils/AppHttpError';

import { LinksSettings, FeatureSettings } from './services/config';
import NamesHelper from 'common/utils/nameHelper';

async function updateProfile(uid: string, diff: Partial<UserProfile>) {
    const res: Partial<UserProfile> = { };

    transferTruthyFields(diff, res,
        'displayName',
        'firstName',
        'lastName',
        'photoURL',
        'zipcode',
        'phone',
    );

    transferDefinedFields(diff, res,
        'bio',
    );

    if (!Object.keys(res).length) {
        return res;
    }

    const updated = await Repo.Users.ensureAndUpdate(uid, res);

    if (res.photoURL || res.displayName) {
        await Repo.Users.updatePublicProfile(uid, {
            photoURL: updated.photoURL || null,
            displayName: updated.displayName,
        });
    }

    return res;
}

async function updateCoachProfile(uid: string, data: UpdateUserDtos.EditCoachProfile.Request): Promise<Partial<CoachProfile>> {
    const diff: Partial<CoachProfile> = { };

    if (transferNotNullFields(data, diff, 'officeNumber') <= 0) {
        return diff;
    }

    await Repo.Coaches.ensureAndUpdate(uid, diff);
    return diff;
}

export const UpdateUser = new FunctionFactory(UsersFunctions.UpdateUserEndpoint)
    .create(async (data, ctx) => {
        if (UpdateUserDtos.RequestDto.isEditProfile(data)) {
            const res = await updateProfile(ctx.auth.uid, data.profile);
            return res;
        }

        if (UpdateUserDtos.RequestDto.isEditCoachProfile(data)) {
            const res = await updateCoachProfile(ctx.auth.uid, data.coach);
            return res;
        }

        if (UpdateUserDtos.RequestDto.isOnboard(data)) {
            const user = await Repo.Users.getUserById(ctx.auth.uid);
            if (!UserRoles.Helper.contains(user.roles, data.onboard.role)) {
                throw AppHttpError.PreconditionFailed('cannot update this user due to roles mismatch');
            }

            const diff = await updateProfile(ctx.auth.uid, {
                ...NamesHelper.split(data.onboard),
                displayName: data.onboard.displayName,
                zipcode: data.onboard.zipcode || null,
                phone: data.onboard.phone || null,
            });
            Object.assign(user, diff);

            if (data.onboard.role === UserRoles.Coach) {
                await onboardCoach(ctx.auth.uid);
            } else if (data.onboard.role === UserRoles.Client) {
                await onboardClient(ctx.auth.uid, user);
            }

            return { ok: true };
        }

        if (UpdateUserDtos.RequestDto.isConsentAccept(data)) {
            const user = await Repo.Users.getUserById(ctx.auth.uid);
            if (!UserRoles.Helper.contains(user.roles, UserRoles.Client)) {
                throw AppHttpError.PreconditionFailed('cannot update this user due to roles mismatch');
            }

            await Repo.Clients.ensure(ctx.auth.uid, {
                consentAccepted: {
                    option: data.consent.option,
                    date: new Date().getTime(),
                },
            });

            return { ok: true };
        }

        if (UpdateUserDtos.RequestDto.isShareReward(data)) {
            const user = await Repo.Users.getUserById(ctx.auth.uid);
            if (!UserRoles.Helper.contains(user.roles, UserRoles.Client)) {
                throw AppHttpError.PreconditionFailed('cannot update this user due to roles mismatch');
            }

            const acc = await Repo.Clients.getAccount(ctx.auth.uid, data.reward.accountId);
            if (!acc) {
                throw AppHttpError.InvalidArguments({ name: 'accountId', error: 'account was not found' });
            }

            data.reward.info.date = Date.now();
            await Repo.Clients.updateAccount(ctx.auth.uid, data.reward.accountId, {
                sharedReward: data.reward.info,
            });

            return { };
        }
    });

async function onboardCoach(uid: string) {
    const coach = await Repo.Coaches.getCoach(uid);
    if (coach?.onboarded) {
        return;
    }

    await Repo.Coaches.ensureAndUpdate(uid, { onboarded: true });
}

async function onboardClient(uid: string, user: UserProfile) {
    const client = await Repo.Clients.getClient(uid);
    if (client.onboarded) {
        return;
    }

    await Repo.Clients.ensure(uid, { onboarded: true });

    // get coach and client card to send notification to coach
    const accounts = await Repo.Clients.getAccounts(uid, { status: ClientStatus.Active });
    if (accounts.length !== 1) {
        console.error('Client has not a single active account');
    } else {
        const acc = accounts[0];
        const coachUser = await Repo.Users.getUserById(acc.coachId);

        const addEmail = FeatureSettings.MobileStandalone
            ? ` (${user.email})`
            : '';

        // notify coach that client has accepted the invitation
        await sendEmail({
            to: coachUser.email,
            data: {
                subject: EmailsScheme.EmailSubjects.InvitationAccepted,
                templateAcceptedClient: {
                    ctaLink: `${LinksSettings.DashboardUrl}client/${acc.id}/overview`,
                    client: {
                        firstName: user.firstName,
                        lastName: `${user.lastName || ''}${addEmail}`,
                    },
                    coach: {
                        firstName: coachUser.firstName,
                        lastName: coachUser.lastName,
                    },
                },
            },
            actionName: 'client accepted invitation',
        });
    }
}
