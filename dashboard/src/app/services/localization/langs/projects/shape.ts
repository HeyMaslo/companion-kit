import type { StringsShape } from 'common/services/localization/defaultShape';

export type DashboardProjectStrings = {

    projectName: string,

    userName: {
        singular: string,
        plural: string,
    },

    clientName: {
        singular: string,
        singularCapitalized: string,
        plural: string,
    },

    // ========== SIGNIN ==============
    signIn: {
        leftBlock: {
            title: string,
        },
    },

    // ========== SIGNUP ==============
    signUp: {
        leftBlock: {
            title: string,
            subtitle: string,
            footer: {
                questionText: string,
                butttonText: string,
            },
            listFeatures: String[],
        },
    },

    onboardingMessage?: string | JSX.Element,

    contactUsEmail: string,
    contactUsLink: string,
    feedbackLink: string,
    helpLink: string,

    // ========== CLIENT EDITOR ==============
    clientEditor: {
        deactivateAccountMessage: string,
    },
};

export type ProjectSpecificLocalization = StringsShape & {
    DashboardProject: DashboardProjectStrings,
};
