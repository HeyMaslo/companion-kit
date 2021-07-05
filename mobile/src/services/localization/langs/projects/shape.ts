import type { StringsShape } from 'common/services/localization/defaultShape';

export type MobileProjectStrings = {
    personaName: string;
    dashboardEssence: string;
    projectName: string;

    contactEmail: string;
    contactUsLink: string;

    missingAccountTitle: string;
    missingAccountDescription?: string;
    disabledClientAccount: string;

    // white papers links
    links: {
        privacy: string;
        terms: string;
        feedback: string;
    };

    assessmentTipText?: string;
};

export type ProjectSpecificLocalization = StringsShape & {
    MobileProject: MobileProjectStrings;
};
