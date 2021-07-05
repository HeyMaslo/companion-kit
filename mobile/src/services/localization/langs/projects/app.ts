import { Strings } from 'common/services/localization/defaultShape';
import { ProjectSpecificLocalization } from './shape';

const Texts: ProjectSpecificLocalization = {
    ...Strings,
    MobileProject: {
        personaName: 'Companion kit',
        dashboardEssence: 'therapist',
        projectName: 'Companion kit',

        contactEmail: '<your email>',
        contactUsLink: 'mailto:<your email>',

        missingAccountTitle:
            'Companion kit is invitation only by your therapist.',
        missingAccountDescription: 'We cannot find an account for this email.',
        disabledClientAccount: 'Your account has been disabled by therapist',

        links: {
            privacy:
                process.env.APP_ENV === 'production'
                    ? '<your app prodution privacy here>'
                    : '<your app staging privacy here>',
            terms:
                process.env.APP_ENV === 'production'
                    ? '<your app prodution terms here>'
                    : '<your app staging terms here>',
            feedback: '',
        },

        assessmentTipText: 'Your therapist wants you to answer a few questions',
    },
};

export default Texts;
