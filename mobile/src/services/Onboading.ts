type ButtonSettings = {
    title: string;
    action: () => void;
};

export type OnboardingSettings = {
    title: string;
    description: string;

    primaryButton: ButtonSettings;
    secondaryButton: ButtonSettings;

    onClose: () => void;
};

// NOTE: now one can implement this to ensure contract compatibility
export interface IOnboardingEnterContext {
    readonly cancel: () => void;
    readonly createStory: () => void;
}

interface IOnboardingExitContext {
    readonly cancel: () => void;
    readonly askNotificationsPermissions?: () => Promise<void>;
}

export type Step = {
    before: (context: IOnboardingEnterContext) => OnboardingSettings;
    after: (context: IOnboardingExitContext) => OnboardingSettings;
};

export const Presets: Step[] = [
    // 1
    {
        before: (context) => ({
            title: 'Welcome',
            description:
                "Think of me as your digital companion. After 7 journals, I'll share some insights with you.",

            primaryButton: {
                title: 'Let’s start',
                action: context.createStory,
            },
            secondaryButton: null,

            onClose: context.cancel,
        }),
        after: (context) => ({
            title: 'Not so bad, was it?',
            description:
                'Would you like to set up a custom reminder so you won’t forget to come back tomorrow?',

            primaryButton: {
                title: 'Yes',
                action: context.askNotificationsPermissions,
            },
            secondaryButton: {
                title: 'Skip',
                action: context.cancel,
            },

            onClose: context.cancel,
        }),
    },
    // 2
    {
        before: (context) => ({
            title: 'Welcome back',
            description:
                'Talk about whatever is on your mind or use my prompts. Press refresh icon to get a different prompt.',

            primaryButton: {
                title: 'Create Your Journal',
                action: context.createStory,
            },
            secondaryButton: null,

            onClose: context.cancel,
        }),
        after: (context) => ({
            title: 'Nice work',
            description:
                'When you leave a voice journal I learn a lot from the tone, volume, and pace of your voice.',

            primaryButton: null,
            secondaryButton: {
                title: 'Got It',
                action: context.cancel,
            },

            onClose: context.cancel,
        }),
    },
    // 3
    {
        before: (context) => ({
            title: 'Ready for Journal #3?',
            description:
                'Thanks for coming back. If you’re in the mood, tell me the story of your moment right now?',

            primaryButton: {
                title: 'Create Your Journal',
                action: context.createStory,
            },
            secondaryButton: null,

            onClose: context.cancel,
        }),
        after: (context) => ({
            title: 'Journal #3 is done',
            description:
                'I just did a little celebration dance. Thanks for sticking with me as I get to know you.',

            primaryButton: null,
            secondaryButton: {
                title: 'Continue',
                action: context.cancel,
            },

            onClose: context.cancel,
        }),
    },
    // 4
    {
        before: (context) => ({
            title: 'Getting the hang of it?',
            description:
                'You’re on a roll, so let’s keep things moving. Ready to get started on your journal #4?',

            primaryButton: {
                title: 'Create Your Journal',
                action: context.createStory,
            },
            secondaryButton: null,

            onClose: context.cancel,
        }),
        after: (context) => ({
            title: 'Excellent',
            description:
                '4 journals down and only 3 left before I’ll have some insights to share with you.',

            primaryButton: null,
            secondaryButton: {
                title: 'Got It',
                action: context.cancel,
            },

            onClose: context.cancel,
        }),
    },
    // 5
    {
        before: (context) => ({
            title: 'Embrace the journey',
            description:
                'Everything is a part of your journey. Even things that don’t look like it. Journal #5, here we go.',

            primaryButton: {
                title: 'Create Your Journal',
                action: context.createStory,
            },
            secondaryButton: null,

            onClose: context.cancel,
        }),
        after: (context) => ({
            title: 'Well done',
            description:
                'You can review your past entries anytime you want in the archive. Would you like to see?',

            primaryButton: {
                title: 'Yes',
                action: context.cancel,
            },
            secondaryButton: {
                title: 'Skip',
                action: context.cancel,
            },

            onClose: context.cancel,
        }),
    },
    // 6
    {
        before: (context) => ({
            title: 'It’s about empathy',
            description:
                'Empathy is part of the process. And that includes being patient with yourself as well.',

            primaryButton: {
                title: 'Create Your Journal',
                action: context.createStory,
            },
            secondaryButton: null,

            onClose: context.cancel,
        }),
        after: (context) => ({
            title: 'Only one left',
            description:
                'One more journal and I’ll be sharing your first set of insights. Are you excited to see your report?',

            primaryButton: null,
            secondaryButton: {
                title: 'Continue',
                action: context.cancel,
            },

            onClose: context.cancel,
        }),
    },
    // 7
    {
        before: (context) => ({
            title: 'It’s been fun',
            description:
                'I’ve enjoyed getting to know you. Let’s complete journal #7, so I can share some insights with you.',

            primaryButton: {
                title: 'Create Your Journal',
                action: context.createStory,
            },
            secondaryButton: null,

            onClose: context.cancel,
        }),
        after: (context) => ({
            title: 'Congratulations!',
            description:
                'You finished your 7th journal post. You can now see how you’ve been feeling throughout the week.',

            primaryButton: {
                title: 'See My Journals',
                action: context.cancel,
            },
            secondaryButton: null,

            onClose: context.cancel,
        }),
    },
];
