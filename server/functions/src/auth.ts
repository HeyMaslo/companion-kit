import { FunctionFactory, throwUnauthenticated } from 'server/utils/createFunction';
import { Users as UsersFunctions } from 'common/abstractions/functions';
import { Repo } from 'server/services/db';
import admin, { AdminLib } from 'server/services/admin';
import { prepareEmail } from 'common/utils/emails';
import {
    CheckRoleRequest,
    BaseResponse,
    AuthActionTypes,
    MagicLinkRequest,
    MagicLinkRequestReasons,
    CheckInviteRequest,
    ForceLoginRequest,
} from 'common/models/dtos/auth';
import { UserRoles, UserProfileIded, ClientStatus, Invitation } from 'common/models';
import { sendEmail, EmailsScheme } from './services/emails';
import { getDashboardLink, getActionCodeSettings } from './services/dynamicLinks';
import { generateAuthToken } from './services/generateToken';
import NamesHelper from 'common/utils/nameHelper';
import { FeatureSettings, AllowedForceLoginEmails, EmailSettings } from './services/config';
import AppHttpError from './utils/AppHttpError';
import { createLogger } from 'common/logger';

const logger = createLogger('[users.auth]');

export const AuthEndpoint = new FunctionFactory(UsersFunctions.AuthEndpoint)
    .create(async (data, ctx) => {

        switch (data.type) {

            case AuthActionTypes.CheckRole: {
                return checkRole(data);
            }

            case AuthActionTypes.CheckInvite: {
                return checkInvite(data);
            }

            case AuthActionTypes.MagicLinkSignIn: {
                return magicLink(data);
            }

            case AuthActionTypes.SendLinkToDesktop: {
                return sendLinkToDesktop(ctx?.auth?.uid);
            }

            case AuthActionTypes.ForceLogin: {
                return forceLogin(data);
            }

            case AuthActionTypes.GenerateMagicLink: {
                return getMagicLigURL(data);
            }

            case AuthActionTypes.SendVerificationCodeEmail: {
                return sendVerificationCodeByEmail(data);
            }

            case AuthActionTypes.ValidateCode: {
                return validateCode(data);
            }

            case AuthActionTypes.ResetPassword: {
                return resetPassword(data);
            }

            case AuthActionTypes.GenerateToken: {
                return generateToken(data);
            }

            case AuthActionTypes.HasAccount: {
                return hasAccount(data);
            }

            default: {
                return {
                    error: 'Unknown action type',
                    result: false,
                };
            }
        }

    });

async function hasAccount(data: { email: string }): Promise<{ result: boolean }> {
    try {
        const user = await admin.auth().getUserByEmail(data.email);
        return { result: !!user };
    } catch (error) {
        return { result: false };
    }
}

async function generateToken(data: { email: string }): Promise<{ result: boolean, token?: string }> {
    const user = await admin.auth().getUserByEmail(data.email);

    if (!user) {
        return { result: false };
    }

    const token = await generateAuthToken(data.email);

    if (!token) {
        return { result: false };
    }

    return { result: true, token };
}

async function resetPassword(data: { email: string, newPassword: string }): Promise<{ result: boolean }> {
    const user = await admin.auth().getUserByEmail(data.email);

    const updateResult = await admin.auth().updateUser(user.uid, {
        password: data.newPassword,
        emailVerified: true,
    });

    return { result: !!updateResult };
}

async function validateCode(data: { email: string, code: string }): Promise<{ result: boolean }> {
    const invite = await Repo.Invites.getInvite(data.email);

    if (!invite || !data.code) {
        return { result: false };
    }

    return { result: invite.verificationCode === data.code };
}

async function sendVerificationCodeByEmail(data: { email: string }): Promise<{ result: boolean, verificationCode: string } | 'noInvitation'> {
    let mailData: EmailsScheme.ClientVerificationCode;

    const requestReason = MagicLinkRequestReasons.SignIn;
    const subject = EmailsScheme.EmailSubjects.getByMagicLinkReason(requestReason);

    const invite = await Repo.Invites.getInvite(data.email);

    if (!invite) {
        return 'noInvitation';
    }
    const verificationCode = `${Math.floor(100000 + Math.random() * 900000)}`;
    await Repo.Invites.udpate(data.email, { verificationCode });

    mailData = {
        subject,
        templateSignInClient: {
            verificationCode: verificationCode,
            projectName: EmailSettings.projectName,
        },
    };

    await sendEmail({
        to: data.email,
        data: mailData,
        templateId: EmailSettings.sendgridVerificationCodeTemplateId,
    });

    return { result: true, verificationCode };
}

async function getUserByEmail(data: { email: string }): Promise<UserProfileIded> {
    const email = prepareEmail(data.email);

    let authUser: AdminLib.auth.UserRecord;
    try {
        authUser = await admin.auth().getUserByEmail(email);
    } catch (err) {
        // logger.log('seems like user not found');
        /* no-op */
    }

    if (!authUser) {
        return null;
    }

    const user1 = await Repo.Users.getUserByEmail(email);
    if (user1) {
        return user1;
    }

    // try to get user with bad email
    if (email !== data.email) {
        const user2 = await Repo.Users.getUserByEmail(data.email);
        if (user2) {
            return user2;
        }
    }

    return null;
}

async function checkInvite(data: CheckInviteRequest): Promise<BaseResponse | { token: string }> {
    const email = prepareEmail(data.email);
    const invite = await Repo.Invites.getInvite(email);

    if (!invite
        || !Invitation.isValid(invite)
        || !invite.role
        || !UserRoles.Helper.contains(invite.role, data.role)
        || (!data.useVerificationCode && invite?.signInKey !== data.key)
    ) {
        return { result: false };
    }

    const token = await generateAuthToken(invite.email);
    return {
        result: true,
        token,
    };
}

async function checkRole(data: CheckRoleRequest): Promise<BaseResponse> {
    if (FeatureSettings.MobileStandalone && data.role === UserRoles.Client) {
        return {
            result: true,
        };
    }

    let [user, invite] = await Promise.all([
        getUserByEmail(data),
        Repo.Invites.getInvite(prepareEmail(data.email)),
    ]);

    if (invite && !Invitation.isValid(invite)) {
        invite = null;
    }

    const ownRoles = UserRoles.Helper.combine(
        user?.roles || UserRoles.Undefined,
        invite ? (invite.role || UserRoles.Client) : UserRoles.Undefined,
    );

    let result = UserRoles.Helper.contains(ownRoles, data.role);

    if (result && data.role === UserRoles.Client) {
        // additionally check active accounts
        // only if it's not a new invitation!
        if (user && !invite) {
            const accs = await Repo.Clients.getAccounts(user.id, { status: ClientStatus.Active });
            result = accs.length > 0;
        }
    }

    return {
        result,
    };
}

async function getMagicLigURL(data: MagicLinkRequest): Promise<{ magicLink: string }> {
    const email = prepareEmail(data.email);
    const actionCodeSettings = getActionCodeSettings(data.continueUrl, data.role === UserRoles.Client);
    const magicLinkUrl = await admin.auth().generateSignInWithEmailLink(email, actionCodeSettings);
    return { magicLink: magicLinkUrl };
}

async function magicLink(data: MagicLinkRequest): Promise<BaseResponse> {
    const user = await getUserByEmail(data);

    const email = prepareEmail(data.email);

    try {
        const actionCodeSettings = getActionCodeSettings(data.continueUrl, data.role === UserRoles.Client);

        const magicLinkUrl = await admin.auth().generateSignInWithEmailLink(email, actionCodeSettings);

        if (!magicLinkUrl) {
            return {
                result: false,
                error: 'Couldn\'t generate magic link',
            };
        }

        let mailData: EmailsScheme.ClientSignIn | EmailsScheme.CoachSignIn | EmailsScheme.CoachSignUp;
        let firstName: string;
        let lastName: string;

        if (user == null) {
            const invite = await Repo.Invites.getInvite(email);

            // if there's an invite – use names from there
            firstName = invite?.name?.first;
            lastName = invite?.name?.last;
        } else {
            firstName = user.firstName;
            lastName = user.lastName;
        }

        const nameSplit = data.fullname && NamesHelper.split({ displayName: data.fullname });
        firstName = firstName || nameSplit?.firstName || 'User';
        lastName = lastName || nameSplit?.lastName || '';

        const requestReason = data.reason || MagicLinkRequestReasons.SignIn;
        const subject = EmailsScheme.EmailSubjects.getByMagicLinkReason(requestReason);

        switch (data.role) {
            case UserRoles.Coach: {
                const template = {
                    ctaLink: magicLinkUrl,
                    coach: { firstName, lastName },
                };

                if (requestReason === MagicLinkRequestReasons.SignUp) {
                    mailData = {
                        subject,
                        templateSignUpCoach: template,
                    };
                } else {
                    mailData = {
                        subject,
                        templateSignInCoach: template,
                        requestReason: EmailsScheme.MagicLinkReasons.fromReason(requestReason),
                    };
                }
                break;
            }

            case UserRoles.Client: {
                mailData = {
                    subject,
                    templateSignInClient: {
                        ctaLink: magicLinkUrl,
                        client: { firstName, lastName },
                    },
                    requestReason: EmailsScheme.MagicLinkReasons.fromReason(requestReason),
                };
                break;
            }

            default: {
                return {
                    result: false,
                    error: 'Invalid role',
                };
            }
        }

        await sendEmail({
            to: data.email,
            data: mailData,
            actionName: `magiclink ${requestReason}`,
        });
    } catch (err) {
        console.error('Magic Link issue eror:', err);
        return {
            result: false,
            error: JSON.stringify(err),
        };
    }

    return { result: true };
}

async function sendLinkToDesktop(uid: string): Promise<BaseResponse> {
    if (!uid) {
        throwUnauthenticated();
    }

    const user = await Repo.Users.getUserById(uid);

    await sendEmail({
        to: user.email,
        data: {
            subject: EmailsScheme.EmailSubjects.Hi,
            templateLinkToDashboard: {
                coach: { firstName: user.firstName, lastName: user.lastName },
                ctaLink: getDashboardLink(),
            },
        },
        actionName: 'link to desktop',
    });

    return { result: true };
}

async function forceLogin(data: ForceLoginRequest): Promise<{ token: string }> {
    const email = prepareEmail(data.email);

    const isAllowed = AllowedForceLoginEmails.includes(email);

    if (!isAllowed) {
        throw AppHttpError.Internal('This feature is disabled.');
    }

    logger.log('Getting user by email:', email);

    const token = await generateAuthToken(email);

    return { token };
}