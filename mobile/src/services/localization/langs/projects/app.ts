import { Strings } from 'common/services/localization/defaultShape';
import { ProjectSpecificLocalization } from './shape';

const Texts: ProjectSpecificLocalization = {
    ...Strings,
    MobileProject: {
        personaName: 'PolarUs',
        dashboardEssence: 'therapist',
        projectName: 'PolarUs',

        contactEmail: '<your email>',
        contactUsLink: 'mailto:<your email>',

        missingAccountTitle: 'PolarUs is currently invitation only',
        missingAccountDescription: 'We cannot find an account for this email.',
        disabledClientAccount: 'Your account has been disabled',

        links: {
            privacy: process.env.APP_ENV === 'production'
                ? '<your app prodution privacy here>'
                : '<your app staging privacy here>',
            terms: process.env.APP_ENV === 'production'
                ? '<your app prodution terms here>'
                : '<your app staging terms here>',
            feedback: '',
        },

        assessmentTipText: 'Your therapist wants you to answer a few questions',
    },
};

export default Texts;
