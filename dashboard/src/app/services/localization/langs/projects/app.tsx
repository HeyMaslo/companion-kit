import React from 'react';
import { Strings } from 'common/services/localization/defaultShape';
import { ProjectSpecificLocalization } from './shape';

const Texts: ProjectSpecificLocalization = {
    ...Strings,
    DashboardProject: {
        projectName: 'Companion kit',

        userName: {
            singular: 'therapist',
            plural: 'therapists',
        },

        clientName: {
            singular: 'client',
            singularCapitalized: 'Client',
            plural: 'clients',
        },

        // ========== SIGNIN ==============
        signIn: {
            leftBlock: {
                title: 'The smart check-in companion for therapists.',
            },
        },

        // ========== SIGNUP ==============
        signUp: {
            leftBlock: {
                title: 'The smart journaling app built for therapists',
                subtitle: 'What you get with Companion kit',
                footer: {
                    questionText: 'Questions?',
                    butttonText: 'Check out our FAQs',
                },
                listFeatures: [
                    'Comprehensive Therapist Dashboard',
                    'Resilience Tracking',
                    'Sentiment Summary',
                    'Emotional Trend Overview',
                    'Voice & Text Journal Recording',
                    'Free iOS and Android apps for Therapists & Clients',
                    'Optional Check-in Notification Alerts',
                ],
            },
        },

        onboardingMessage: (
            <>
                I’m Companion kit and my job is to help you connect with and assist your clients via their mobile phones. I’d like to show you how to get around in your dashboard and get the most from me.
            </>
        ),

        contactUsEmail: '<your email here>',
        contactUsLink: 'mailto:<your email here>?Subject=Companion kit dashboard',
        feedbackLink: '',
        helpLink: '',

        // ========== CLIENT EDITOR ==============
        clientEditor: {
            deactivateAccountMessage: 'Deactivating your client’s account is permanent and will remove all data including check-ins.',
        },
    },
};

Texts.Validation.PhoneCountry = 'Only US, CA, MX numbers are supported';

export default Texts;