import Axios from 'axios';
import {
    SENDGRID_API_KEY,
    SENDGRID_EMAIL_VALIDATION_API_KEY,
    EMAIL_OVERRIDE_ADDRESS,
    EmailSettings,
} from 'server/services/config';
import SendGrid from '@sendgrid/mail';
import { MailDataRequired as SGMailData } from '@sendgrid/helpers/classes/mail';
import { createLogger } from 'common/logger';
import { MagicLinkRequestReasons } from 'common/models/dtos/auth';

const logger = createLogger('[Emails]');

if (!SENDGRID_API_KEY) {
    logger.error('Missing SendGrid API key! Sending emails will be a no-ops.');
} else {
    logger.log('Setting SendGrid API key:', SENDGRID_API_KEY.substring(0, 12), '...');
    SendGrid.setApiKey(SENDGRID_API_KEY);
}

const ProjectName = EmailSettings.projectName;

export const AdminEmail = EmailSettings.adminEmail;

export namespace EmailsScheme {
    type Name = {
        firstName: string,
        lastName: string,
    };

    export type MagicLinkReasons = {
        isSignIn?: boolean,
        isPassword?: boolean,
        isPasswordChange?: boolean,
        isEmailChange?: boolean,
    };

    export namespace MagicLinkReasons {
        export function fromReason(r: MagicLinkRequestReasons): MagicLinkReasons {
            switch (r) {
                case MagicLinkRequestReasons.PasswordReset: {
                    return { isPassword: true };
                }

                case MagicLinkRequestReasons.PasswordChange: {
                    return { isPasswordChange: true };
                }

                case MagicLinkRequestReasons.EmailReset: {
                    return { isEmailChange: true };
                }

                default: {
                    return { isSignIn: true };
                }
            }
        }
    }

    export const EmailSubjects = {
        getByMagicLinkReason(r: MagicLinkRequestReasons) {
            switch (r) {
                case MagicLinkRequestReasons.PasswordChange:
                case MagicLinkRequestReasons.PasswordReset: {
                    return `Set a new password for ${ProjectName}`;
                }

                case MagicLinkRequestReasons.EmailReset: {
                    return `Confirm email change for ${ProjectName}`;
                }

                case MagicLinkRequestReasons.SignUp: {
                    return `Sign Up to ${ProjectName}`;
                }

                case MagicLinkRequestReasons.SignIn:
                default: {
                    return `Sign In to ${ProjectName}`;
                }
            }
        },
        Invitation: `You've been invited to ${ProjectName}`,
        InvitationAccepted: `Your client has accepted the invitation`,
        Hi: `Hi from ${ProjectName}`,
        AdminApprove: `New registration on ${ProjectName}`,
    };

    interface BaseScheme {
        subject: string;
    }

    interface BaseType {
        ctaLink: string,
    }

    interface ClientBaseType extends BaseType {
        client: Name;
    }

    interface CoachBaseType extends BaseType {
        coach: Name;
    }

    interface CoachRegistrationDataType extends BaseType {
        coach: Name & { email: string };
        organization: string;
        date: string;
    }

    interface ClientAndCoachType extends ClientBaseType, CoachBaseType {
    }

    export interface InviteClient extends BaseScheme {
        templateInviteClient: ClientAndCoachType;
    }

    export interface ClientAcceptedInvite extends BaseScheme {
        templateAcceptedClient: ClientAndCoachType
    }

    export interface CoachSignIn extends BaseScheme {
        templateSignInCoach: CoachBaseType;
        requestReason: MagicLinkReasons,
    }

    export interface CoachSignUp extends BaseScheme {
        templateSignUpCoach: CoachBaseType;
    }

    export interface ClientSignIn extends BaseScheme {
        templateSignInClient: ClientBaseType;
        requestReason: MagicLinkReasons,
    }

    export interface ClientVerificationCode extends BaseScheme {
        templateSignInClient: {
            projectName: string;
            verificationCode: string;
        };
    }

    export interface LinkToDashboard extends BaseScheme {
        templateLinkToDashboard: CoachBaseType;
    }

    export interface AdminApprove extends BaseScheme {
        templateAdminApprove: CoachRegistrationDataType;
    }

    export type AnyScheme = InviteClient | LinkToDashboard | AdminApprove | CoachSignIn | ClientSignIn | CoachSignUp | ClientAcceptedInvite | ClientVerificationCode;
}

export interface MailInfo {
    to: string | string[];

    data: EmailsScheme.AnyScheme;

    actionName?: string,

    templateId?: string;
}

export async function validateEmailAddress(e: string) {
    if (!SENDGRID_EMAIL_VALIDATION_API_KEY) {
        return null;
    }

    const resp = await Axios('https://api.sendgrid.com/v3/validations/email', {
        method: 'post',
        data: JSON.stringify({ email: e, source: 'signup' }),
        headers: {
            'authorization': `Bearer ${SENDGRID_EMAIL_VALIDATION_API_KEY}`,
            'content-type': 'application/json',
        },
    });

    const result = await resp.data;
    return result;
}

export async function sendEmail(email: MailInfo) {
    if (!SENDGRID_API_KEY) {
        logger.warn('Skipping sending email due to missing of SendGrid API key:', email);
        return;
    }

    const subject = EMAIL_OVERRIDE_ADDRESS
        ? `[Addressed to ${email.to}] ${email.data.subject}`
        : email.data.subject;

    email.data.subject = subject;

    const to = EMAIL_OVERRIDE_ADDRESS || email.to;

    const data: SGMailData = {
        templateId: email.templateId || EmailSettings.sendgridTemplateId,
        to: to,
        from: EmailSettings.fromAddress,
        subject: subject,
        dynamicTemplateData: {
            ...email.data,
            __timestamp: new Date().toUTCString(),
            __action: email.actionName || 'default',
        },
        trackingSettings: {
            clickTracking: {
                enable: false,
            },
        },
    };

    const result = await SendGrid.send(data);
    const resp = result[0] || {} as any;

    logger.log('Sending email:', data, '\r\n RESULT:', resp.statusCode, resp.statusMessage, resp.body);
}
